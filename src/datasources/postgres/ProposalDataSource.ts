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
import { QuestionaryStep, Questionary } from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";
import { ILogger } from "../../utils/Logger";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  constructor(private logger: ILogger) {}

  async checkActiveCall(): Promise<Boolean> {
    const currentDate = new Date().toISOString();
    return database
      .select()
      .from("call")
      .where("start_call", "<=", currentDate)
      .andWhere("end_call", ">=", currentDate)
      .first()
      .then((call: any) => (call ? true : false));
  }

  async setStatusProposal(
    id: number,
    status: number
  ): Promise<Proposal | null> {
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
        if (proposal === undefined || !proposal.length) {
          return null;
        }
        return createProposalObject(proposal[0]);
      });
  }

  async submitProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 1);
  }
  async acceptProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 2);
  }
  async rejectProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 3);
  }

  async deleteProposal(id: number): Promise<Proposal | null> {
    return database("proposals")
      .where("proposals.proposal_id", id)
      .del()
      .from("proposals")
      .returning("*")
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || !proposal.length) {
          this.logger.logError("Could not delete proposal", { id });
          return null;
        }
        return createProposalObject(proposal[0]);
      })
      .catch((e: Error) => {
        this.logger.logException("Exception while deleting proposal", e);
      });
  }

  async setProposalUsers(id: number, users: number[]): Promise<Boolean> {
    return database.transaction(function(trx: { commit: any; rollback: any }) {
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
          return true;
        })
        .catch(() => {
          trx.rollback;
          return false;
        });
    });
  }

  async updateAnswer(
    proposal_id: number,
    question_id: string,
    answer: string
  ): Promise<Boolean> {
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
        });
    } else {
      return database
        .insert({
          proposal_id: proposal_id,
          proposal_question_id: question_id,
          answer: answer
        })
        .into("proposal_answers");
    }
  }

  async insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[] | null> {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if (!answerId) {
      return null;
    }

    await database("proposal_answers_files").insert(
      files.map(file => ({ answer_id: answerId, file_id: file }))
    );

    return files;
  }

  async deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<Boolean | null> {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if (!answerId) {
      return null;
    }

    await database("proposal_answers_files")
      .where({ answer_id: answerId })
      .del();

    return true;
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

  async update(proposal: Proposal): Promise<Proposal | null> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          status: proposal.status
        },
        ["*"]
      )
      .from("proposals")
      .where("proposal_id", proposal.id)
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || !proposal.length) {
          return null;
        }
        return createProposalObject(proposal[0]);
      });
  }

  async get(id: number) {
    return database
      .select()
      .from("proposals")
      .where("proposal_id", id)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async create(proposerID: number) {
    return database
      .insert({ proposer_id: proposerID }, ["*"])
      .from("proposals")
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      })
      .catch((error: any) => {
        this.logger.logException("Failed to create proposal", error);
      });
  }

  async getProposals(filter?: string, first?: number, offset?: number) {
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

  async getUserProposals(id: number) {
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

    const fieldRecords: Array<
      ProposalQuestionRecord & { value: any }
    > = (await database.raw(`
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
            proposal_questions.sort_order`)).rows;

    const topicRecords: (TopicRecord & {
      is_complete: boolean;
    })[] = (await database.raw(`
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
            proposal_topics.sort_order`)).rows;

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
          topic.is_complete,
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
  ): Promise<Boolean | null> {
    return database
      .transaction(async (tr: any) => {
        for (const topic_id of topicsCompleted) {
          await database
            .raw(
              `INSERT into proposal_topic_completenesses(proposal_id, topic_id, is_complete) VALUES(?,?,?) ON CONFLICT (proposal_id, topic_id)  DO UPDATE set is_complete=true`,
              [proposalId, topic_id, true]
            )
            .transacting(tr);
        }
      })
      .then(() => {
        return true;
      })
      .catch((error: Error) => {
        this.logger.logException("Could not update topic completeness", error);
        return null;
      });
  }
}
