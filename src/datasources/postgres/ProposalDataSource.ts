import database from "./database";
import {
  ProposalRecord,
  TopicRecord,
  ProposalQuestionRecord,
  FieldDependencyRecord,
  createProposalObject,
  createFieldDependencyObject,
  createTopicObject,
  createQuestionaryFieldObject
} from "./records";

import { ProposalDataSource } from "../ProposalDataSource";
import {
  QuestionaryStep,
  Questionary,
  ProposalStatus
} from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";
import { Transaction } from "knex";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  public async checkActiveCall(): Promise<Boolean> {
    const currentDate = new Date().toISOString();
    return database
      .select()
      .from("call")
      .where("start_call", "<=", currentDate)
      .andWhere("end_call", ">=", currentDate)
      .first()
      .then((call: any) => (call ? true : false));
  }

  async setStatusProposal(id: number, status: number): Promise<Proposal> {
    return database
      .update(
        {
          status
        },
        ["*"]
      )
      .from("proposals")
      .where("proposal_id", id)
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
  async acceptProposal(id: number): Promise<Proposal> {
    return this.setStatusProposal(id, ProposalStatus.ACCEPTED);
  }
  async rejectProposal(id: number): Promise<Proposal> {
    return this.setStatusProposal(id, ProposalStatus.REJECTED);
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return database("proposals")
      .where("proposals.proposal_id", id)
      .del()
      .from("proposals")
      .returning("*")
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
        .from("proposal_user")
        .where("proposal_id", id)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_id: id, user_id: user_id })
              .into("proposal_user")
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
      .from("proposal_answers")
      .where({
        proposal_id: proposal_id,
        proposal_question_id: question_id
      })
      .first();

    const hasEntry = results && results.count !== "0";
    if (hasEntry) {
      return database("proposal_answers")
        .update({
          answer: answer
        })
        .where({
          proposal_id: proposal_id,
          proposal_question_id: question_id
        })
        .then(() => question_id);
    } else {
      return database("proposal_answers")
        .insert({
          proposal_id: proposal_id,
          proposal_question_id: question_id,
          answer: answer
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

    await database("proposal_answers_files").insert(
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

    return await database("proposal_answers_files")
      .where({ answer_id: answerId })
      .returning("file_id")
      .del();
  }

  private async getAnswerId(
    proposal_id: number,
    question_id: string
  ): Promise<number | null> {
    const selectResult = await database
      .from("proposal_answers")
      .where({
        proposal_id: proposal_id,
        proposal_question_id: question_id
      })
      .select("answer_id");

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
          final_status: proposal.finalStatus
        },
        ["*"]
      )
      .from("proposals")
      .where("proposal_id", proposal.id)
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
      .from("proposals")
      .where("proposal_id", id)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async create(proposerID: number): Promise<Proposal> {
    return database
      .insert({ proposer_id: proposerID }, ["*"])
      .from("proposals")
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      });
  }

  async getProposals(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(["*", database.raw("count(*) OVER() AS full_count")])
      .from("proposals")
      .orderBy("proposal_id", "desc")
      .modify((query: any) => {
        if (filter) {
          query
            .where("title", "ilike", `%${filter}%`)
            .orWhere("abstract", "ilike", `%${filter}%`);
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
          proposals: props
        };
      });
  }

  async getUserProposals(id: number): Promise<Proposal[]> {
    return database
      .select("p.*")
      .from("proposals as p")
      .leftJoin("proposal_user as pc", {
        "p.proposal_id": "pc.proposal_id"
      })
      .where("pc.user_id", id)
      .orWhere("p.proposer_id", id)
      .groupBy("p.proposal_id")
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => createProposalObject(proposal))
      );
  }

  async getQuestionary(proposalId: number): Promise<Questionary> {
    const dependencyRecords: FieldDependencyRecord[] = await database
      .select("*")
      .from("proposal_question_dependencies");

    const fieldRecords: Array<ProposalQuestionRecord & { value: any }> = (
      await database.raw(`
          SELECT 
            proposal_questions.*, proposal_answers.answer as value
          FROM 
            proposal_questions
          LEFT JOIN
            proposal_answers 
          ON 
            proposal_questions.proposal_question_id = 
            proposal_answers.proposal_question_id
          AND
            proposal_answers.proposal_id=${proposalId}
          ORDER BY
            proposal_questions.sort_order`)
    ).rows;

    const topicRecords: (TopicRecord & {
      is_complete: boolean;
    })[] = (
      await database.raw(`
          SELECT 
            proposal_topics.*, proposal_topic_completenesses.is_complete
          FROM 
            proposal_topics
          LEFT JOIN
            proposal_topic_completenesses
          ON 
            proposal_topics.topic_id = proposal_topic_completenesses.topic_id
            AND proposal_topic_completenesses.proposal_id = ${proposalId}
          ORDER BY
            proposal_topics.sort_order`)
    ).rows;

    const dependencies = dependencyRecords.map(record =>
      createFieldDependencyObject(record)
    );

    const fields = fieldRecords.map(record =>
      createQuestionaryFieldObject(record)
    );

    let steps = Array<QuestionaryStep>();
    topicRecords.forEach(topic => {
      steps.push(
        new QuestionaryStep(
          createTopicObject(topic),
          topic.is_complete || false,
          fields.filter(field => field.topic_id === topic.topic_id)
        )
      );
    });

    fields.forEach(field => {
      // @ts-ignore we are nullchecking inside the filter callbackfn
      field.dependencies = dependencies.filter(dep => {
        return (
          dep !== null &&
          dep.proposal_question_id === field.proposal_question_id
        );
      });
    });

    return new Questionary(steps);
  }

  async updateTopicCompletenesses(
    proposalId: number,
    topicsCompleted: number[]
  ): Promise<void> {
    return database.transaction(async (tr: any) => {
      for (const topic_id of topicsCompleted) {
        await database
          .raw(
            `INSERT into proposal_topic_completenesses(proposal_id, topic_id, is_complete) VALUES(?,?,?) ON CONFLICT (proposal_id, topic_id)  DO UPDATE set is_complete=true`,
            [proposalId, topic_id, true]
          )
          .transacting(tr);
      }
    });
  }
}
