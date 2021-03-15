import { logger } from '@esss-swap/duo-logger';
import BluePromise from 'bluebird';
import { Transaction } from 'knex';

import { Event } from '../../events/event.enum';
import { Proposal } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { getQuestionDefinition } from '../../models/questionTypes/QuestionRegistry';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import database from './database';
import {
  CallRecord,
  createProposalObject,
  createProposalViewObject,
  NextStatusEventRecord,
  ProposalEventsRecord,
  ProposalRecord,
  ProposalViewRecord,
  QuestionaryRecord,
} from './records';

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

  async submitProposal(id: number): Promise<Proposal> {
    return database
      .update(
        {
          submitted: true,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', id)
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new Error(`Failed to submit proposal with id '${id}'`);
        }

        return createProposalObject(proposal[0]);
      });
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
    return database.transaction(function (trx: Transaction) {
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
        .catch((error) => {
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
          status_id: proposal.statusId,
          proposer_id: proposal.proposerId,
          rank_order: proposal.rankOrder,
          final_status: proposal.finalStatus,
          comment_for_user: proposal.commentForUser,
          comment_for_management: proposal.commentForManagement,
          notified: proposal.notified,
          submitted: proposal.submitted,
          management_time_allocation: proposal.managementTimeAllocation,
          management_decision_submitted: proposal.managementDecisionSubmitted,
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

  async updateProposalStatus(
    proposalId: number,
    proposalStatusId: number
  ): Promise<Proposal> {
    return database
      .update(
        {
          status_id: proposalStatusId,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', proposalId)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal not found ${proposalId}`);
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
      .insert({ proposer_id, call_id, questionary_id, status_id: 1 }, ['*'])
      .from('proposals')
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      });
  }

  async getProposalsFromView(
    filter?: ProposalsFilter
  ): Promise<ProposalView[]> {
    return database
      .select()
      .from('proposal_table_view')
      .modify((query) => {
        if (filter?.callId) {
          query.where('proposal_table_view.call_id', filter?.callId);
        }
        if (filter?.instrumentId) {
          query.where(
            'proposal_table_view.instrument_id',
            filter?.instrumentId
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
            `proposal_table_view.short_code similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }
        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;
          const questionFilterQuery = getQuestionDefinition(
            questionFilter.dataType
          ).filterQuery;
          if (questionFilterQuery) {
            query
              .leftJoin(
                'answers',
                'answers.questionary_id',
                'proposal_table_view.questionary_id'
              )
              .andWhere('answers.question_id', questionFilter.questionId)
              .modify(questionFilterQuery, questionFilter);
          }
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        return proposals.map((proposal) => createProposalViewObject(proposal));
      });
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(['proposals.*', database.raw('count(*) OVER() AS full_count')])
      .from('proposals')
      .orderBy('proposals.proposal_id', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }

        if (filter?.questionaryIds) {
          query.whereIn('proposals.questionary_id', filter.questionaryIds);
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_id',
              'proposals.proposal_id'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentId
            );
        }

        if (filter?.proposalStatusId) {
          query.where('proposals.status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposals.short_code similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getInstrumentScientistProposals(
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposals')
      .join('instrument_has_scientists', {
        'instrument_has_scientists.user_id': scientistId,
      })
      .join('instrument_has_proposals', {
        'instrument_has_proposals.proposal_id': 'proposals.proposal_id',
        'instrument_has_proposals.instrument_id':
          'instrument_has_scientists.instrument_id',
      })
      .orderBy('proposals.proposal_id', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query.where(
            'instrument_has_proposals.instrument_id',
            filter.instrumentId
          );
        }

        if (filter?.proposalStatusId) {
          query.where('proposals.status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposals.short_code similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

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
        proposals.map((proposal) => createProposalObject(proposal))
      );
  }

  async markEventAsDoneOnProposal(
    event: Event,
    proposalId: number
  ): Promise<ProposalEventsRecord | null> {
    const dataToInsert = {
      proposal_id: proposalId,
      [event.toLowerCase()]: true,
    };

    const result = await database.raw(
      `? ON CONFLICT (proposal_id)
        DO UPDATE SET
        ${event.toLowerCase()} = true
        RETURNING *;`,
      [database('proposal_events').insert(dataToInsert)]
    );

    if (result.rows && result.rows.length) {
      return result.rows[0];
    } else {
      return null;
    }
  }

  async getCount(callId: number): Promise<number> {
    return database('proposals')
      .count('call_id')
      .where('call_id', callId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async cloneProposal(
    clonerId: number,
    proposalId: number,
    callId: number,
    templateId: number
  ): Promise<Proposal> {
    const sourceProposal = await this.get(proposalId);

    if (!sourceProposal) {
      logger.logError(
        'Could not clone proposal because source proposal does not exist',
        { proposalId }
      );

      throw new Error('Could not clone proposal');
    }

    const [newQuestionary]: QuestionaryRecord[] = (
      await database.raw(`
      INSERT INTO questionaries
      (
        template_id,
        creator_id
      )
      SELECT
        ${templateId},
        ${clonerId}
      FROM 
        questionaries
      WHERE
        questionary_id = ${sourceProposal.questionaryId}
      RETURNING *
    `)
    ).rows;

    await database.raw(`
      INSERT INTO answers
      (
        questionary_id,
        question_id,
        answer
      )
      SELECT
        ${newQuestionary.questionary_id},
        question_id,
        answer
      FROM 
        answers
      WHERE
        questionary_id = ${sourceProposal.questionaryId}
    `);

    const [newProposal]: ProposalRecord[] = (
      await database.raw(`
      INSERT INTO proposals
      (
        title,
        abstract,
        status_id,
        proposer_id,
        call_id,
        questionary_id,
        notified,
        submitted
      )
      SELECT
        'Copy of ${sourceProposal.title}',
        abstract,
        1,
        proposer_id,
        ${callId},
        ${newQuestionary.questionary_id},
        false,
        false
      FROM 
        proposals
      WHERE
        proposal_id = ${sourceProposal.id}
      RETURNING *
    `)
    ).rows;

    return createProposalObject(newProposal);
  }

  async resetProposalEvents(
    proposalId: number,
    callId: number,
    statusId: number
  ): Promise<boolean> {
    const proposalCall: CallRecord = await database('call')
      .select('*')
      .where('call_id', callId)
      .first();

    if (!proposalCall) {
      logger.logError(
        'Could not reset proposal events because proposal call does not exist',
        { callId }
      );

      throw new Error('Could not reset proposal events');
    }

    const proposalEventsToReset: NextStatusEventRecord[] = (
      await database.raw(`
        SELECT 
          *
        FROM 
          proposal_workflow_connections AS pwc
        JOIN
          next_status_events
        ON
          next_status_events.proposal_workflow_connection_id = pwc.proposal_workflow_connection_id
        WHERE pwc.proposal_workflow_connection_id >= (
          SELECT proposal_workflow_connection_id
          FROM proposal_workflow_connections
          WHERE proposal_workflow_id = ${proposalCall.proposal_workflow_id}
          AND proposal_status_id = ${statusId}
        )
        AND pwc.proposal_workflow_id = ${proposalCall.proposal_workflow_id};
      `)
    ).rows;

    if (proposalEventsToReset?.length) {
      const dataToUpdate = proposalEventsToReset
        .map(
          (event) => `${event.next_status_event.toLocaleLowerCase()} = false`
        )
        .join(', ');

      const [updatedProposalEvents]: ProposalEventsRecord[] = (
        await database.raw(`
        UPDATE proposal_events SET ${dataToUpdate}
        WHERE proposal_id = ${proposalId}
        RETURNING *
      `)
      ).rows;

      if (!updatedProposalEvents) {
        logger.logError('Could not reset proposal events', { dataToUpdate });

        throw new Error('Could not reset proposal events');
      }
    }

    return true;
  }
}
