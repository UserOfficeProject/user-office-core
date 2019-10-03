import database from "./database";
import { ProposalRecord, TopicRecord, ProposalQuestionRecord, FieldDependencyRecord } from "./records";

import { ProposalDataSource } from "../ProposalDataSource";
import {
  Proposal,
  ProposalTemplate,
  ProposalTemplateField,
  FieldDependency,
  Topic,
  ProposalAnswer,
  DataType
} from "../../models/Proposal";
import { ILogger } from "../../utils/Logger";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  constructor(private logger: ILogger) {}

  private createProposalObject(proposal: ProposalRecord) {
    return new Proposal(
      proposal.proposal_id,
      proposal.title,
      proposal.abstract,
      proposal.proposer_id,
      proposal.status,
      proposal.created_at,
      proposal.updated_at
    );
  }

  private createTopicObject(proposal: TopicRecord) {
    return new Topic(
      proposal.topic_id,
      proposal.topic_title,
      proposal.is_enabled,
      proposal.sort_order,
      null
    );
  }

  private createFieldDependencyObject(fieldDependency: FieldDependencyRecord) {
    return new FieldDependency(
      fieldDependency.proposal_question_id,
      fieldDependency.proposal_question_dependency,
      fieldDependency.condition
    );
  }


  

  private createProposalTemplateFieldObject(question: ProposalQuestionRecord) {
    // <-- make ProposalRespondedQuestinon, because question does not have a value, but ProposalRespondedQuestinon does, ProposalRespondedQuestinon shoudl extend Question
    return new ProposalTemplateField(
      question.proposal_question_id,
      question.data_type as DataType,
      question.sort_order,
      question.question,
      question.topic_id,
      question.config,
      null,
      undefined
    );
  }

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
        return this.createProposalObject(proposal[0]);
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
        return this.createProposalObject(proposal[0]);
      });
  }

  async get(id: number) {
    return database
      .select()
      .from("proposals")
      .where("proposal_id", id)
      .first()
      .then((proposal: ProposalRecord) => this.createProposalObject(proposal));
  }

  async create(proposerID: number) {
    return database
      .insert({ proposer_id: proposerID }, ["*"])
      .from("proposals")
      .then((resultSet: ProposalRecord[]) => {
        return this.createProposalObject(resultSet[0]);
      })
      .catch((error: any) => {
        this.logger.logError("Failed to create proposal", { error });
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
        const props = proposals.map(proposal =>
          this.createProposalObject(proposal)
        );
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
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => this.createProposalObject(proposal))
      );
  }

  async getProposalTemplate(): Promise<ProposalTemplate> {
    const deps: FieldDependency[] = await database
      .select("*")
      .from("proposal_question_dependencies");

    const fieldRecords: ProposalQuestionRecord[] = await database
      .select("*")
      .from("proposal_questions")
      .orderBy("sort_order");

    const topicRecords: TopicRecord[] = await database
      .select("p.*")
      .from("proposal_topics as p")
      .where("p.is_enabled", true)
      .orderBy("sort_order");

    const topics = topicRecords.map(record => this.createTopicObject(record));
    const fields = fieldRecords.map(record =>
      this.createProposalTemplateFieldObject(record)
    );

    topics.forEach(topic => {
      topic.fields = fields.filter(field => field.topic_id === topic.topic_id);
    });
    fields.forEach(field => {
      field.dependencies = deps.filter(
        dep => dep.proposal_question_id === field.proposal_question_id
      );
    });

    return new ProposalTemplate(topics);
  }

  async getProposalAnswers(proposalId: number): Promise<ProposalAnswer[]> {
    return await database("proposal_answers")
      .where("proposal_id", proposalId)
      .select("proposal_question_id", "answer as value"); // TODO rename the column
  }

  async createTopic(title: string): Promise<Topic> {
    return database
      .insert({ topic_title: title }, ["*"])
      .from("proposal_topics")
      .then((resultSet: TopicRecord[]) => {
        if (!resultSet || resultSet.length != 1) {
          this.logger.logError("Failed to create topic", { title });
          return null;
        }
        return this.createTopicObject(resultSet[0]);
      });
  }

  async updateTopic(
    id: number,
    values: {
      title?: string;
      isEnabled?: boolean;
      sortOrder?:number;
    }
  ): Promise<Topic | null> {
    return database
      .update(
        {
          topic_title: values.title,
          is_enabled: values.isEnabled,
          sortOrder: values.sortOrder
        },
        ["*"]
      )
      .from("proposal_topics")
      .where({ topic_id: id })
      .then((resultSet: TopicRecord[]) => {
        if (!resultSet || resultSet.length != 1) {
          this.logger.logError("Failed to update topic", { data: values, id });
          return null;
        }
        return this.createTopicObject(resultSet[0]);
      });
  }

  async updateField(
    proposal_question_id: string,
    values: {
      data_type?: string;
      question?: string;
      topic_id?: number;
      config?: string;
      sort_order: number;
    }
  ): Promise<ProposalTemplateField | null> {
    return database
      .update(values, ["*"])
      .from("proposal_questions")
      .where("proposal_question_id", proposal_question_id)
      .then((resultSet: ProposalQuestionRecord[]) => {
        if (!resultSet || resultSet.length != 1) {
          this.logger.logError("Unexpected updateField resultSet encountered", {
            resultSet,
            proposal_question_id,
            values
          });
          return null;
        }

        return this.createProposalTemplateFieldObject(resultSet[0]);
      })
      .catch((e: any) => {
        this.logger.logError("Could not update field", {
          error: e,
          proposal_question_id,
          values
        });
        return null;
      });
  }
}
