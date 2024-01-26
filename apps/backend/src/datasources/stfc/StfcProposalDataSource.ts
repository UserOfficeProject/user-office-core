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
        'instruments.name AS call_instrument_name',
        'instruments.instrument_id AS call_instrument_id',
        database.raw('count(*) OVER() AS full_count'),
      ])
      .from('proposal_table_view')
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
          this.whereRaw(
            '? = ANY(proposal_table_view.internal_technical_reviewer_ids)',
            user.id
          );
        } else {
          this.whereRaw(
            '? = ANY(proposal_table_view.instrument_scientist_ids)',
            user.id
          ).orWhereRaw(
            '? = ANY(proposal_table_view.instrument_manager_ids)',
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
          query.whereRaw(
            '? = ANY(proposal_table_view.technical_review_assignee_ids)',
            user.id
          );
        }
        if (filter?.callId) {
          query.where('proposal_table_view.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query.whereRaw(
            '? = ANY(proposal_table_view.instrument_ids)',
            filter.instrumentId
          );
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
      .then(
        (
          proposals: (ProposalViewRecord & {
            call_instrument_id: number;
            call_instrument_name: string;
          })[]
        ) => {
          const props = proposals.map((proposal) => {
            const prop = createProposalViewObject(proposal);
            prop.instrumentIds = [proposal.call_instrument_id];
            prop.instrumentNames = [proposal.call_instrument_name];

            return prop;
          });

          return {
            totalCount: proposals[0] ? proposals[0].full_count : 0,
            proposals: props,
          };
        }
      );

    return result;
  }
}
