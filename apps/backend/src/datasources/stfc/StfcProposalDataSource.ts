import { injectable } from 'tsyringe';

import { ProposalView } from '../../models/ProposalView';
import { ReviewerFilter } from '../../models/Review';
import { Roles } from '../../models/Role';
import { UserWithRole } from '../../models/User';
import { removeDuplicates } from '../../utils/helperFunctions';
import database from '../postgres/database';
import {
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
    const proposals = database
      .select('proposal_pk')
      .from('proposal_table_view')
      .join(
        'call_has_instruments',
        'call_has_instruments.call_id',
        '=',
        'ptw.call_id'
      )
      .join(
        'instruments',
        'instruments.instrument_id',
        '=',
        'call_has_instruments.instrument_id'
      )
      .leftJoin(
        'instrument_has_scientists',
        'instrument_has_scientists.instrument_id',
        '=',
        'call_has_instruments.instrument_id'
      )
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
          this.whereRaw('? = ANY(internal_technical_reviewer_ids)', user.id);
        } else {
          this.where('instrument_has_scientists.user_id', user.id).orWhere(
            'instruments.manager_user_id',
            user.id
          );
        }
      });

    const result = database
      .with(
        'ptw',
        database
          .select([
            '*',
            database.raw(
              // eslint-disable-next-line quotes
              "array_to_string(instrument_names, ',') all_instrument_names"
            ),
          ])
          .from('proposal_table_view')
      )
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('ptw')
      .whereIn('proposal_pk', proposals)
      .orderBy('proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('proposal_id', 'ilike', `%${filter.text}%`)
            .orWhere('proposal_status_name', 'ilike', `%${filter.text}%`)
            .orWhere('all_instrument_names', 'ilike', `%${filter.text}%`);
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          query.whereRaw('? = ANY(technical_review_assignee_ids)', user.id);
        }
        if (filter?.callId) {
          query.where('call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query.whereRaw('? = ANY(instrument_ids)', filter.instrumentId);
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
    const proposals = await super.getProposalsFromView(
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText
    );

    const technicalReviewers = removeDuplicates(
      proposals.proposalViews
        .filter((proposal) => !!proposal.technicalReviewAssigneeIds?.length)
        .map((proposal) => proposal.technicalReviewAssigneeIds.map(String))
        .flat()
    );

    const technicalReviewersDetails =
      await stfcUserDataSource.getStfcBasicPeopleByUserNumbers(
        technicalReviewers,
        false
      );

    const propsWithTechReviewerDetails = proposals.proposalViews.map(
      (proposal) => {
        const users =
          !!proposal.technicalReviewAssigneeIds &&
          technicalReviewersDetails.filter((user) =>
            proposal.technicalReviewAssigneeIds.find(
              (id) => id?.toString() === user.userNumber
            )
          );

        const userDetails = users?.length
          ? {
              technicalReviewAssigneeNames: users.map((user) => {
                const firstName = user?.firstNameKnownAs
                  ? user.firstNameKnownAs
                  : user?.givenName ?? '';
                const lastName = user?.familyName ?? '';

                return `${firstName} ${lastName}`;
              }),
            }
          : {};

        return {
          ...proposal,
          ...userDetails,
        };
      }
    );

    return {
      proposalViews: propsWithTechReviewerDetails,
      totalCount: proposals.totalCount,
    };
  }
}
