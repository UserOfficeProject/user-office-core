import { injectable } from 'tsyringe';

import { ProposalView } from '../../models/ProposalView';
import { ReviewerFilter } from '../../models/Review';
import { Roles } from '../../models/Role';
import { UserWithRole } from '../../models/User';
import database from '../postgres/database';
import {
  createProposalViewObject,
  ProposalViewRecord,
} from '../postgres/records';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import PostgresProposalDataSource from './../postgres/ProposalDataSource';

@injectable()
export default class StfcProposalDataSource extends PostgresProposalDataSource {
  async getInstrumentScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const result = database
      .select([
        'proposal_table_view.*',
        database.raw('count(*) OVER() AS full_count'),
      ])
      .from('proposal_table_view')
      .join(
        'call_has_instruments',
        'call_has_instruments.call_id',
        '=',
        'proposal_table_view.call_id'
      )
      .join(
        'instruments',
        'instruments.instrument_id',
        '=',
        'call_has_instruments.instrument_id'
      )
      .join(
        'instrument_has_scientists',
        'instrument_has_scientists.instrument_id',
        '=',
        'call_has_instruments.instrument_id'
      )
      .leftJoin(
        'internal_reviews',
        'proposal_table_view.technical_review_id',
        'internal_reviews.technical_review_id'
      )
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
          this.where('internal_reviews.reviewer_id', user.id);
        } else {
          this.where('instrument_has_scientists.user_id', user.id).orWhere(
            'instruments.manager_user_id',
            user.id
          );
        }
      })
      .distinct('proposal_table_view.proposal_pk')
      .orderBy('proposal_table_view.proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('proposal_table_view.title', 'ilike', `%${filter.text}%`)
            .orWhere('proposal_id', 'ilike', `%${filter.text}%`)
            .orWhere('proposal_status_name', 'ilike', `%${filter.text}%`)
            .orWhere('instrument_name', 'ilike', `%${filter.text}%`);
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          query.where(
            'proposal_table_view.technical_review_assignee_id',
            user.id
          );
        }
        if (filter?.callId) {
          query.where('proposal_table_view.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query.where('instruments.instrument_id', filter.instrumentId);
        }

        if (filter?.proposalStatusId) {
          query.where(
            'proposal_table_view.proposal_status_id',
            filter?.proposalStatusId
          );
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_table_view.proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }

        if (filter?.referenceNumbers) {
          query.whereIn(
            'proposal_table_view.proposal_id',
            filter.referenceNumbers
          );
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) => {
          const prop = createProposalViewObject(proposal);

          return prop;
        });

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });

    return result;
  }
}
