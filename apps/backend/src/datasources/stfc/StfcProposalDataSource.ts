import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { ReviewerFilter } from '../../models/Review';
import { Roles } from '../../models/Role';
import { UserWithRole } from '../../models/User';
import { ProposalViewTechnicalReview } from '../../resolvers/types/ProposalView';
import { removeDuplicates } from '../../utils/helperFunctions';
import database from '../postgres/database';
import {
  CallRecord,
  createCallObject,
  createProposalViewObject,
  ProposalViewRecord,
} from '../postgres/records';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import PostgresProposalDataSource from './../postgres/ProposalDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

const stfcUserDataSource = new StfcUserDataSource();

@injectable()
export default class StfcProposalDataSource extends PostgresProposalDataSource {
  async getInstrumentScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const stfcUserIds: number[] = filter?.text
      ? [
          ...(
            await stfcUserDataSource.getUsers({ filter: filter.text })
          ).users.map((user) => user.id),
        ]
      : [];

    const proposals = database
      .select('proposal_pk')
      .from('proposal_table_view')
      .join(
        'call_has_instruments as chi',
        'chi.call_id',
        '=',
        'proposal_table_view.call_id'
      )
      .join('instruments as in', 'in.instrument_id', '=', 'chi.instrument_id')
      .leftJoin(
        'instrument_has_scientists as ihs',
        'ihs.instrument_id',
        '=',
        'chi.instrument_id'
      )
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
          // NOTE: Using jsonpath we check the jsonb (technical_reviews) field if it contains internalReviewers array of objects with id equal to user.id
          this.whereRaw(
            'jsonb_path_exists(technical_reviews, \'$[*].internalReviewers[*].id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        } else {
          this.where('ihs.user_id', user.id).orWhere(
            'in.manager_user_id',
            user.id
          );
        }
      });
    const result = database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .join(
        'users',
        'users.user_id',
        '=',
        'proposal_table_view.principal_investigator'
      )
      .whereIn('proposal_pk', proposals)
      .orderBy('proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query.where(function () {
            this.where('title', 'ilike', `%${filter.text}%`)
              .orWhere('proposal_id', 'ilike', `%${filter.text}%`)
              .orWhere('proposal_status_name', 'ilike', `%${filter.text}%`)
              .orWhere('users.email', 'ilike', `%${filter.text}%`)
              .orWhere('users.firstname', 'ilike', `%${filter.text}%`)
              .orWhere('users.lastname', 'ilike', `%${filter.text}%`)
              .orWhere('principal_investigator', 'in', stfcUserIds)
              // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with name equal to searchText case insensitive
              .orWhereRaw(
                'jsonb_path_exists(instruments, \'$[*].name \\? (@.type() == "string" && @ like_regex :searchText: flag "i")\')',
                { searchText: filter.text }
              );
          });
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          // NOTE: Using jsonpath we check the jsonb (technical_reviews) field if it contains object with id equal to user.id
          query.whereRaw(
            'jsonb_path_exists(technical_reviews, \'$[*].technicalReviewAssignee.id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        }
        if (filter?.callId) {
          query.where('call_id', filter.callId);
        }
        if (filter?.instrumentFilter?.instrumentId) {
          // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with id equal to filter.instrumentId
          query.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].id \\? (@.type() == "number" && @ == :instrumentId:)\')',
            { instrumentId: filter?.instrumentFilter?.instrumentId }
          );
        }
        if (filter?.proposalStatusId) {
          query.where('proposal_status_id', filter?.proposalStatusId);
        }

        if (filter?.excludeProposalStatusIds) {
          query.where(
            'proposal_status_id',
            'not in',
            filter?.excludeProposalStatusIds
          );
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposal_id', filter.referenceNumbers);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });

    return result;
  }

  async getProposalsFromView(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }> {
    const stfcUserIds: number[] = searchText
      ? [
          ...(
            await stfcUserDataSource.getUsers({ filter: searchText })
          ).users.map((ids) => ids.id),
        ]
      : [];
    const proposals = await super.getProposalsFromView(
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText,
      stfcUserIds
    );

    const technicalReviewers = removeDuplicates(
      proposals.proposalViews
        .filter((proposal) => !!proposal.technicalReviews?.length)
        .map(({ technicalReviews }) =>
          (technicalReviews as ProposalViewTechnicalReview[]).map(
            (techicalReview) =>
              techicalReview.technicalReviewAssignee.id.toString()
          )
        )
        .flat()
    );

    const technicalReviewersDetails =
      await stfcUserDataSource.getStfcBasicPeopleByUserNumbers(
        technicalReviewers,
        false
      );

    const propsWithTechReviewerDetails = proposals.proposalViews.map(
      (proposal) => {
        let proposalTechnicalReviews: ProposalViewTechnicalReview[] = [];
        const { technicalReviews } = proposal;

        if (technicalReviews?.length) {
          proposalTechnicalReviews = technicalReviews.map((technicalReview) => {
            const userDetails = technicalReviewersDetails.find(
              (trd) =>
                trd.userNumber ===
                technicalReview.technicalReviewAssignee.id.toString()
            );

            const firstName = userDetails?.firstNameKnownAs
              ? userDetails.firstNameKnownAs
              : userDetails?.givenName ?? '';
            const lastName = userDetails?.familyName ?? '';

            return {
              ...technicalReview,
              technicalReviewAssignee: {
                id: technicalReview.technicalReviewAssignee.id,
                firstname: firstName,
                lastname: lastName,
              },
            };
          });
        }

        return {
          ...proposal,
          technicalReviews: proposalTechnicalReviews,
        };
      }
    );

    return {
      proposalViews: propsWithTechReviewerDetails,
      totalCount: proposals.totalCount,
    };
  }

  async cloneProposal(sourceProposal: Proposal, call: Call): Promise<Proposal> {
    const result = await database
      .select()
      .from('call')
      .where('call_id', sourceProposal.callId)
      .first()
      .then((call: CallRecord | null) =>
        call ? createCallObject(call) : null
      );

    if (result?.templateId === 15 && result?.proposalWorkflowId === 5) {
      return Promise.reject(
        ` ('${sourceProposal.proposalId}') because it is a legacy proposal `
      );
    }

    return await super.cloneProposal(sourceProposal, call);
  }

  async getTechniqueScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const proposals = database
      .select('proposal_pk')
      .from('proposal_table_view')
      .join(
        'technique_has_proposals as thp',
        'thp.proposal_id',
        '=',
        'proposal_table_view.proposal_pk'
      )
      .join('techniques as tech', 'tech.technique_id', '=', 'thp.technique_id')
      .leftJoin(
        'technique_has_scientists as ths',
        'ths.technique_id',
        '=',
        'thp.technique_id'
      )
      .leftJoin(
        'technique_has_instruments as thi',
        'thi.technique_id',
        '=',
        'thp.technique_id'
      )
      .leftJoin(
        'instruments as ins',
        'thi.instrument_id',
        '=',
        'ins.instrument_id'
      )
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INSTRUMENT_SCIENTIST) {
          this.where('ths.user_id', user.id);
        }
        if (filter?.techniqueFilter?.techniqueId) {
          this.where('tech.technique_id', filter?.techniqueFilter?.techniqueId);
        }
        if (filter?.instrumentFilter?.instrumentId) {
          this.where(
            'thi.instrument_id',
            filter?.instrumentFilter?.instrumentId
          );
        }
      });

    const result = database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .whereIn('proposal_pk', proposals)
      .modify((query) => {
        if (filter?.text) {
          query.where(function () {
            this.where('title', 'ilike', `%${filter.text}%`)
              .orWhere('proposal_id', 'ilike', `%${filter.text}%`)
              .orWhere('proposal_status_name', 'ilike', `%${filter.text}%`);
          });
        }
        if (filter?.callId) {
          query.where('call_id', filter.callId);
        }

        if (filter?.proposalStatusId) {
          query.where('proposal_status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposal_id', filter.referenceNumbers);
        }

        if (
          filter?.dateFilter?.from !== undefined &&
          filter?.dateFilter?.from !== null
        ) {
          const dateParts: string[] = filter.dateFilter.from.split('-');
          const dateObject: Date = new Date(
            +dateParts[2],
            +dateParts[1] - 1,
            +dateParts[0]
          );

          query.where('submitted_date', '>=', dateObject);
        }

        if (
          filter?.dateFilter?.to !== undefined &&
          filter?.dateFilter?.to !== null
        ) {
          const dateParts: string[] = filter.dateFilter.to.split('-');
          const dateObject: Date = new Date(
            +dateParts[2],
            +dateParts[1] - 1,
            +dateParts[0]
          );
          query.where('submitted_date', '<=', dateObject);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });

    return result;
  }

  // async updateSubmittedDate(proposalPk: number): Promise<Proposal> {
  //   return database
  //     .update(
  //       {
  //         submitted_date: new Date(),
  //       },
  //       ['*']
  //     )
  //     .from('proposals')
  //     .where('proposal_pk', proposalPk)
  //     .then((records: ProposalRecord[]) => {
  //       if (records === undefined || !records.length) {
  //         throw new GraphQLError(`Proposal not found ${proposalPk}`);
  //       }

  //       return createProposalObject(records[0]);
  //     });
  // }
}
