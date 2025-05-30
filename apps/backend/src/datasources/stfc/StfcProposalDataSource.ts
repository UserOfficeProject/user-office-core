import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { ReviewerFilter } from '../../models/Review';
import { Roles } from '../../models/Role';
import { UserWithRole } from '../../models/User';
import { ProposalViewTechnicalReview } from '../../resolvers/types/ProposalView';
import { removeDuplicates } from '../../utils/helperFunctions';
import { CallDataSource } from '../CallDataSource';
import PostgresAdminDataSource from '../postgres/AdminDataSource';
import database from '../postgres/database';
import {
  CallRecord,
  createCallObject,
  createProposalViewObject,
  ProposalViewRecord,
} from '../postgres/records';
import PostgresWorkflowDataSource from '../postgres/WorkflowDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import PostgresProposalDataSource from './../postgres/ProposalDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

const postgresProposalDataSource = new PostgresProposalDataSource(
  new PostgresWorkflowDataSource(),
  new PostgresAdminDataSource()
);

const fieldMap: { [key: string]: string } = {
  finalStatus: 'final_status',
  callShortCode: 'call_short_code',
  //'instruments.name': "instruments->0->'name'",
  statusName: 'proposal_status_id',
  proposalId: 'proposal_id',
  title: 'title',
  submitted: 'submitted',
  notified: 'notified',
  submittedDate: 'submitted_date',
};

@injectable()
export default class StfcProposalDataSource extends PostgresProposalDataSource {
  protected stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;
  protected callDataSource: CallDataSource = container.resolve(
    Tokens.CallDataSource
  ) as CallDataSource;

  async getInstrumentScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const stfcUserIds: number[] = filter?.text
      ? [
          ...(
            await this.stfcUserDataSource.getUsers({ filter: filter.text })
          ).users.map((user) => user.id),
        ]
      : [];

    const techniqueProposalCallIds: number[] = (
      await this.callDataSource.getCalls({
        proposalStatusShortCode: 'QUICK_REVIEW',
      })
    ).map((call) => call.id);

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
        if (techniqueProposalCallIds) {
          this.where(
            'proposal_table_view.call_id',
            'not in',
            techniqueProposalCallIds
          );
        }

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
        if (filter?.instrumentFilter?.showMultiInstrumentProposals) {
          query.whereRaw('jsonb_array_length(instruments) > 1');
        } else if (filter?.instrumentFilter?.instrumentId) {
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
      .then(async (proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        const propsWithTechReviewerDetails =
          await this.getTechReviewersDetails(props);

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: propsWithTechReviewerDetails,
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
            await this.stfcUserDataSource.getUsers({ filter: searchText })
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

    const propsWithTechReviewerDetails = await this.getTechReviewersDetails(
      proposals.proposalViews
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
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return postgresProposalDataSource.getTechniqueScientistProposals(
      user,
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText
    );
  }

  async getTechReviewersDetails(proposals: ProposalView[]) {
    const technicalReviewers = removeDuplicates(
      proposals
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
      await this.stfcUserDataSource.getStfcBasicPeopleByUserNumbers(
        technicalReviewers,
        false
      );

    return proposals.map((proposal) => {
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
    });
  }
}
