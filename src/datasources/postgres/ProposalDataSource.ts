import database from "./database";
import {
  ProposalRecord,
  TopicRecord,
  ProposalQuestionRecord,
  FieldDependencyRecord
} from "./records";

import { ProposalDataSource } from "../ProposalDataSource";
import {
  ProposalTemplate,
  ProposalTemplateField,
  FieldDependency,
  Topic,
  DataType,
  TemplateStep,
  FieldCondition,
  QuestionaryStep,
  Questionary,
  QuestionaryField
} from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";
import { ILogger } from "../../utils/Logger";
import to from "await-to-js";

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
      proposal.sort_order,
      proposal.is_enabled
    );
  }

  private createFieldDependencyObject(fieldDependency: FieldDependencyRecord) {
    if (!fieldDependency) {
      return null;
    }
    const conditionJson = JSON.parse(fieldDependency.condition);
    return new FieldDependency(
      fieldDependency.proposal_question_id,
      fieldDependency.proposal_question_dependency,
      JSON.stringify(
        new FieldCondition(conditionJson.condition, conditionJson.params)
      ) // TODO SWAP-341. Remove stringifying
    );
  }

  private createProposalTemplateFieldObject(question: ProposalQuestionRecord) {
    return new ProposalTemplateField(
      question.proposal_question_id,
      question.data_type as DataType,
      question.sort_order,
      question.question,
      question.config,
      question.topic_id,
      null
    );
  }

  private createQuestionaryFieldObject(
    question: ProposalQuestionRecord & { value: any }
  ) {
    return new QuestionaryField(
      new ProposalTemplateField(
        question.proposal_question_id,
        question.data_type as DataType,
        question.sort_order,
        question.question,
        question.config,
        question.topic_id,
        null
      ),
      question.value || ""
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
        return this.createProposalObject(proposal[0]);
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
      .groupBy("p.proposal_id")
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => this.createProposalObject(proposal))
      );
  }

  async getProposalTemplate(): Promise<ProposalTemplate> {
    const dependencies: FieldDependency[] = await database
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

    let steps = Array<TemplateStep>();
    topics.forEach(topic => {
      steps.push(
        new TemplateStep(
          topic,
          fields.filter(field => field.topic_id === topic.topic_id)
        )
      );
    });

    fields.forEach(field => {
      field.dependencies = dependencies.filter(
        dep => dep.proposal_question_id === field.proposal_question_id
      );
    });

    return new ProposalTemplate(steps);
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
      this.createFieldDependencyObject(record)
    );

    const fields = fieldRecords.map(record =>
      this.createQuestionaryFieldObject(record)
    );

    let steps = Array<QuestionaryStep>();
    topicRecords.forEach(topic => {
      steps.push(
        new QuestionaryStep(
          this.createTopicObject(topic),
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

  async createTopic(sortOrder: number): Promise<ProposalTemplate> {
    await database("proposal_topics")
      .update({ sort_order: sortOrder + 1 })
      .where("sort_order", ">=", sortOrder);

    await database("proposal_topics").insert({
      topic_title: "New Topic",
      sort_order: sortOrder,
      is_enabled: true
    });
    return this.getProposalTemplate();
  }

  async updateTopic(
    id: number,
    values: {
      title?: string;
      isEnabled?: boolean;
      sortOrder?: number;
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
          this.logger.logError("Failed to update topic", {
            data: values,
            id
          });
          return null;
        }
        return this.createTopicObject(resultSet[0]);
      });
  }

  async updateField(
    proposal_question_id: string,
    values: {
      dataType?: string;
      question?: string;
      topicId?: number;
      config?: string;
      sortOrder?: number;
      dependencies?: FieldDependency[];
    }
  ): Promise<ProposalTemplate | null> {
    const rows = {
      data_type: values.dataType,
      question: values.question,
      topic_id: values.topicId,
      config: values.config,
      sort_order: values.sortOrder
    };

    if (values.dependencies) {
      await database("proposal_question_dependencies")
        .where("proposal_question_id", proposal_question_id)
        .del();
      values.dependencies.forEach(async dependency => {
        await database("proposal_question_dependencies").insert({
          proposal_question_id: dependency.proposal_question_id,
          proposal_question_dependency: dependency.proposal_question_dependency,
          condition: dependency.condition // TODO rename consitancy
        });
      });
    }

    return new Promise(async (resolve, reject) => {
      await database
        .update(rows, ["*"])
        .from("proposal_questions")
        .where("proposal_question_id", proposal_question_id);
      resolve(await this.getProposalTemplate());
    });
  }

  createTemplateField(
    fieldId: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField | null> {
    return database
      .insert(
        {
          proposal_question_id: fieldId,
          topic_id: topicId,
          data_type: dataType,
          question: question,
          config: config
        },
        ["*"]
      )
      .from("proposal_questions")
      .then((resultSet: ProposalQuestionRecord[]) => {
        if (!resultSet || resultSet.length != 1) {
          this.logger.logError(
            "INSERT field resultSet must contain exactly 1 row",
            {
              resultSet,
              topicId,
              dataType
            }
          );
          return null;
        }

        return this.createProposalTemplateFieldObject(resultSet[0]);
      })
      .catch((e: Error) => {
        this.logger.logException(
          "Exception occurred while inserting field",
          e,
          {
            topicId,
            dataType
          }
        );
        return null;
      });
  }

  getTemplateField(fieldId: string): Promise<ProposalTemplateField | null> {
    return database("proposal_questions")
      .where({ proposal_question_id: fieldId })
      .select("*")
      .then((resultSet: ProposalQuestionRecord[]) => {
        if (!resultSet || resultSet.length == 0) {
          this.logger.logWarn(
            "SELECT from proposal_question yielded no results",
            { fieldId }
          );
          return null;
        }
        if (resultSet.length > 1) {
          this.logger.logError(
            "Select from proposal_question yelded in more than one row",
            { fieldId }
          );
          return null;
        }
        return this.createProposalTemplateFieldObject(resultSet[0]);
      });
  }

  deleteTemplateField(fieldId: string): Promise<ProposalTemplate | null> {
    return new Promise(async (resolve, reject) => {
      const [err] = await to(
        database("proposal_questions")
          .where({ proposal_question_id: fieldId })
          .del()
      );
      if (err) {
        this.logger.logError("Could not delete field ", err);
        resolve(null);
      } else {
        resolve(await this.getProposalTemplate());
      }
    });
  }

  async deleteTopic(id: number): Promise<Boolean | null> {
    return database("proposal_topics")
      .where({ topic_id: id })
      .del()
      .then(() => true)
      .catch((e: Error) => {
        this.logger.logException("Could not delete topic ", e, { id });
        return false;
      });
  }

  async updateTopicOrder(topicOrder: number[]): Promise<Boolean | null> {
    topicOrder.forEach(async (topicId, index) => {
      database("proposal_topics")
        .update({ sort_order: index })
        .where({ topic_id: topicId })
        .catch((e: Error) => {
          this.logger.logError("Could not updateTopicOrder", e);
        });
    });
    return true;
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
