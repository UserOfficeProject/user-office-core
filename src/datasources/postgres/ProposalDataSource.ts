/* eslint-disable @typescript-eslint/camelcase */
import BluePromise from 'bluebird';
import { Transaction } from 'knex';

import { Proposal } from '../../models/Proposal';
import { ProposalStatus } from '../../models/ProposalModel';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import database from './database';
import { CallRecord, createProposalObject, ProposalRecord } from './records';

export default class PostgresProposalDataSource implements ProposalDataSource {
  // TODO move this function to callDataSource
  public async checkActiveCall(callId: number): Promise<boolean> {
    const currentDate = new Date().toISOString();

    return database
      .select()
      .from('call')
      .where('start_call', '<=', currentDate)
      .andWhere('end_call', '>=', currentDate)
      .andWhere('call_id', '=', callId)
      .first()
      .then((call: CallRecord) => (call ? true : false));
  }

  async setStatusProposal(id: number, status: number): Promise<Proposal> {
    return database
      .update(
        {
          status,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', id)
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new Error(
            `Failed to set status '${status}' for proposal with id '${id}'`
          );
        }

        return createProposalObject(proposal[0]);
      });
  }

  async submitProposal(id: number): Promise<Proposal> {
    return this.setStatusProposal(id, ProposalStatus.SUBMITTED);
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return database('proposals')
      .where('proposals.proposal_id', id)
      .del()
      .from('proposals')
      .returning('*')
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new Error(`Could not delete proposal with id:${id}`);
        }

        return createProposalObject(proposal[0]);
      });
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    return database.transaction(function(trx: Transaction) {
      return database
        .from('proposal_user')
        .where('proposal_id', id)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_id: id, user_id: user_id })
              .into('proposal_user')
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
        })
        .catch(error => {
          trx.rollback;
          throw error; // re-throw
        });
    });
  }

  async update(proposal: Proposal): Promise<Proposal> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          status: proposal.status,
          proposer_id: proposal.proposerId,
          rank_order: proposal.rankOrder,
          final_status: proposal.finalStatus,
          comment_for_user: proposal.commentForUser,
          comment_for_management: proposal.commentForManagement,
          notified: proposal.notified,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', proposal.id)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal not found ${proposal.id}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async get(id: number): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('proposal_id', id)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async create(
    proposer_id: number,
    call_id: number,
    questionary_id: number
  ): Promise<Proposal> {
    return database
      .insert({ proposer_id, call_id, questionary_id }, ['*'])
      .from('proposals')
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      });
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposals')
      .orderBy('proposal_id', 'desc')
      .modify(query => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }
        if (filter?.templateIds) {
          query.whereIn('template_id', filter.templateIds);
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map(proposal => createProposalObject(proposal));

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getUserProposals(id: number): Promise<Proposal[]> {
    return database
      .select('p.*')
      .from('proposals as p')
      .leftJoin('proposal_user as pc', {
        'p.proposal_id': 'pc.proposal_id',
      })
      .where('pc.user_id', id)
      .orWhere('p.proposer_id', id)
      .groupBy('p.proposal_id')
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => createProposalObject(proposal))
      );
  }
}
