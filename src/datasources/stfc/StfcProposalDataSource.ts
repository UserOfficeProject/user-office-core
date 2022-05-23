import { injectable } from 'tsyringe';

import { ProposalView } from '../../models/ProposalView';
import { ReviewerFilter } from '../../models/Review';
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
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const result = database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .join('instruments', function () {
        this.on({
          'instruments.instrument_id':
            'proposal_table_view.proposal_instrument_id',
        }).orOn({
          'instruments.instrument_id': 'proposal_table_view.call_instrument_id',
        });
      })
      .leftJoin('instrument_has_scientists', function () {
        this.on({
          'instrument_has_scientists.instrument_id':
            'proposal_table_view.proposal_instrument_id',
        }).orOn({
          'instrument_has_scientists.instrument_id':
            'proposal_table_view.call_instrument_id',
        });
      })
      .where(function () {
        this.where('instrument_has_scientists.user_id', scientistId).orWhere(
          'instruments.manager_user_id',
          scientistId
        );
      })
      .distinct('proposal_table_view.proposal_pk')
      .orderBy('proposal_table_view.proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          query.where(
            'proposal_table_view.technical_review_assignee_id',
            scientistId
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
}
