/* eslint-disable @typescript-eslint/camelcase */
import BluePromise from 'bluebird';
import { Transaction } from 'knex';

import { Proposal } from '../../models/Proposal';
import {
  ProposalStatus,
  Questionary,
  QuestionaryStep,
} from '../../models/ProposalModel';
import { ProposalDataSource } from '../ProposalDataSource';
import { Answer } from './../../models/ProposalModel';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import database from './database';
import {
  CallRecord,
  createProposalObject,
  createQuestionRelObject,
  createTopicObject,
  ProposalQuestionProposalTemplateRelRecord,
  ProposalQuestionRecord,
  ProposalRecord,
  TopicRecord,
} from './records';

export default class PostgresProposalDataSource implements ProposalDataSource {
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

  async updateAnswer(
    proposal_id: number,
    question_id: string,
    answer: string
  ): Promise<string> {
    const results: { count: string } = await database
      .count()
      .from('answers')
      .where({
        proposal_id: proposal_id,
        proposal_question_id: question_id,
      })
      .first();

    const hasEntry = results && results.count !== '0';
    if (hasEntry) {
      return database('answers')
        .update({
          answer: answer,
        })
        .where({
          proposal_id: proposal_id,
          proposal_question_id: question_id,
        })
        .then(() => question_id);
    } else {
      return database('answers')
        .insert({
          proposal_id: proposal_id,
          proposal_question_id: question_id,
          answer: answer,
        })
        .then(() => question_id);
    }
  }

  async insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[]> {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if (!answerId) {
      throw new Error(
        `Could not insert files because answer does not exist. AnswerID ${answerId}`
      );
    }

    await database('answer_has_files').insert(
      files.map(file => ({ answer_id: answerId, file_id: file }))
    );

    return files;
  }

  async deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<string[]> {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if (!answerId) {
      throw new Error(
        `Could not delete files because answer does not exist. AnswerID ${answerId}`
      );
    }

    return await database('answer_has_files')
      .where({ answer_id: answerId })
      .returning('file_id')
      .del();
  }

  private async getAnswerId(
    proposal_id: number,
    question_id: string
  ): Promise<number | null> {
    const selectResult = await database
      .from('answers')
      .where({
        proposal_id: proposal_id,
        proposal_question_id: question_id,
      })
      .select('answer_id');

    if (!selectResult || selectResult.length != 1) {
      return null;
    }

    return selectResult[0].answer_id;
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
    proposerId: number,
    callId: number,
    templateId: number
  ): Promise<Proposal> {
    return database
      .insert(
        { proposer_id: proposerId, call_id: callId, template_id: templateId },
        ['*']
      )
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

  private async getQuestionaryWithTemplateId(
    proposalId: number,
    templateId: number
  ): Promise<Questionary> {
    const topicRecords: (TopicRecord & {
      is_complete: boolean;
    })[] = (
      await database.raw(`
          SELECT 
            topics.*, topic_completenesses.is_complete
          FROM 
            topics
          LEFT JOIN
            topic_completenesses
          ON 
            topics.topic_id = topic_completenesses.topic_id
            AND topic_completenesses.proposal_id = ${proposalId}
          WHERE
            topics.template_id = ${templateId}
          ORDER BY
            topics.sort_order`)
    ).rows;

    const answerRecords: Array<ProposalQuestionRecord &
      ProposalQuestionProposalTemplateRelRecord & { value: any }> = (
      await database.raw(`
            SELECT 
              templates_has_questions.*, questions.*, answers.answer as value
            FROM 
              templates_has_questions
            LEFT JOIN
            questions 
            ON 
              templates_has_questions.proposal_question_id = 
              questions.proposal_question_id
            LEFT JOIN
              answers
            ON
              templates_has_questions.proposal_question_id = 
              answers.proposal_question_id
            AND
              answers.proposal_id=${proposalId}
            ORDER BY
             templates_has_questions.sort_order`)
    ).rows;

    const fields = answerRecords.map(record => {
      const value = record.value ? JSON.parse(record.value).value : '';

      return new Answer(createQuestionRelObject(record), value);
    });

    const steps = Array<QuestionaryStep>();
    topicRecords.forEach(topic => {
      steps.push(
        new QuestionaryStep(
          createTopicObject(topic),
          topic.is_complete || false,
          fields.filter(field => field.topicId === topic.topic_id)
        )
      );
    });

    return new Questionary(steps);
  }

  async getEmptyQuestionary(callId: number): Promise<Questionary> {
    return await database('call')
      .select('*')
      .where('call_id', callId)
      .then((rows: CallRecord[]) => {
        const call = rows[0];

        return this.getQuestionaryWithTemplateId(0, call.template_id);
      });
  }

  async getQuestionary(proposalId: number): Promise<Questionary> {
    const proposal = await this.get(proposalId);
    if (!proposal) {
      throw new Error(`No proposal with id: ${proposalId}`);
    }

    return this.getQuestionaryWithTemplateId(proposal.id, proposal.templateId);
  }

  async updateTopicCompletenesses(
    proposalId: number,
    topicsCompleted: number[]
  ): Promise<void> {
    return database.transaction(async (tr: any) => {
      for (const topic_id of topicsCompleted) {
        await database
          .raw(
            'INSERT into topic_completenesses(proposal_id, topic_id, is_complete) VALUES(?,?,?) ON CONFLICT (proposal_id, topic_id)  DO UPDATE set is_complete=true',
            [proposalId, topic_id, true]
          )
          .transacting(tr);
      }
    });
  }
}
