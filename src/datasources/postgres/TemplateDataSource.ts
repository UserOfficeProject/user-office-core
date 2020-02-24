import database from "./database";
import {
  TopicRecord,
  ProposalQuestionRecord,
  createTopicObject,
  createProposalTemplateFieldObject,
  createFieldDependencyObject,
  FieldDependencyRecord
} from "./records";

import { TemplateDataSource } from "../TemplateDataSource";
import {
  ProposalTemplate,
  ProposalTemplateField,
  FieldDependency,
  Topic,
  DataType,
  TemplateStep
} from "../../models/ProposalModel";

import to from "await-to-js";

export default class PostgresTemplateDataSource implements TemplateDataSource {
  async getProposalTemplate(): Promise<ProposalTemplate> {
    const dependenciesRecord: FieldDependencyRecord[] = await database
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

    const topics = topicRecords.map(record => createTopicObject(record));
    const fields = fieldRecords.map(record =>
      createProposalTemplateFieldObject(record)
    );
    const dependencies = dependenciesRecord.map(record =>
      createFieldDependencyObject(record)
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
  ): Promise<Topic> {
    const resultSet: TopicRecord[] = await database
      .update(
        {
          topic_title: values.title,
          is_enabled: values.isEnabled,
          sortOrder: values.sortOrder
        },
        ["*"]
      )
      .from("proposal_topics")
      .where({ topic_id: id });

    if (!resultSet || resultSet.length != 1) {
      throw new Error("INSERT Topic resultSet must contain exactly 1 row");
    }
    return createTopicObject(resultSet[0]);
  }

  async updateTemplateField(
    proposal_question_id: string,
    values: {
      naturalKey?: string;
      dataType?: string;
      question?: string;
      topicId?: number;
      config?: string;
      sortOrder?: number;
      dependencies?: FieldDependency[];
    }
  ): Promise<ProposalTemplate> {
    const rows = {
      natural_key: values.naturalKey,
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

      for (const dependency of values.dependencies) {
        await database("proposal_question_dependencies").insert({
          proposal_question_id: dependency.proposal_question_id,
          proposal_question_dependency: dependency.proposal_question_dependency,
          condition: dependency.condition
        });
      }
    }

    return database
      .update(rows, ["*"])
      .from("proposal_questions")
      .where("proposal_question_id", proposal_question_id)
      .then(async () => await this.getProposalTemplate());
  }

  async createTemplateField(
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField> {
    const resultSet: ProposalQuestionRecord[] = await database
      .insert(
        {
          proposal_question_id: fieldId,
          natural_key: naturalKey,
          topic_id: topicId,
          data_type: dataType,
          question: question,
          config: config
        },
        ["*"]
      )
      .from("proposal_questions");

    if (!resultSet || resultSet.length != 1) {
      throw new Error("INSERT field resultSet must contain exactly 1 row");
    }

    return createProposalTemplateFieldObject(resultSet[0]);
  }

  async getTemplateField(
    fieldId: string
  ): Promise<ProposalTemplateField | null> {
    return database("proposal_questions")
      .where({ proposal_question_id: fieldId })
      .select("*")
      .then((resultSet: ProposalQuestionRecord[]) => {
        if (!resultSet || resultSet.length === 0) {
          return null;
        }
        return createProposalTemplateFieldObject(resultSet[0]);
      });
  }

  async deleteTemplateField(fieldId: string): Promise<ProposalTemplate> {
    const [, rowsAffected] = await to(
      database("proposal_questions")
        .where({ proposal_question_id: fieldId })
        .del()
    );
    if (rowsAffected !== 1) {
      throw new Error(`Could not delete template field ${fieldId}`);
    }
    return await this.getProposalTemplate();
  }

  async deleteTopic(id: number): Promise<Topic> {
    return database("proposal_topics")
      .where({ topic_id: id })
      .del(["*"])
      .then((result: TopicRecord[]) => {
        if (!result || result.length !== 1) {
          throw new Error(`Could not delete topic ${id}`);
        }
        return createTopicObject(result[0]);
      });
  }

  async updateTopicOrder(topicOrder: number[]): Promise<number[]> {
    topicOrder.forEach(async (topicId, index) => {
      return database("proposal_topics")
        .update({ sort_order: index })
        .where({ topic_id: topicId });
    });
    return topicOrder;
  }
}
