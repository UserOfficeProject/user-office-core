import database from "./database";
import {
  TopicRecord,
  ProposalQuestionRecord,
  createTopicObject,
  createProposalTemplateFieldObject
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
import { ILogger } from "../../utils/Logger";
import to from "await-to-js";

export default class PostgresTemplateDataSource implements TemplateDataSource {
  constructor(private logger: ILogger) {}

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

    const topics = topicRecords.map(record => createTopicObject(record));
    const fields = fieldRecords.map(record =>
      createProposalTemplateFieldObject(record)
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
  ): Promise<Topic | null> {
    const [error, resultSet] = await to<TopicRecord[]>(
      database
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
    );

    if (error) {
      this.logger.logError("Error occurred while updating topic", {
        values,
        id
      });
      return null;
    }

    if (!resultSet || resultSet.length != 1) {
      this.logger.logError(
        "INSERT Topic resultSet must contain exactly 1 row",
        { values, id, resultSet }
      );
      return null;
    }
    return createTopicObject(resultSet[0]);
  }

  async updateTemplateField(
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

      for (const dependency of values.dependencies) {
        await database("proposal_question_dependencies").insert({
          proposal_question_id: dependency.proposal_question_id,
          proposal_question_dependency: dependency.proposal_question_dependency,
          condition: dependency.condition
        });
      }
    }

    return new Promise(async (resolve, reject) => {
      await database
        .update(rows, ["*"])
        .from("proposal_questions")
        .where("proposal_question_id", proposal_question_id);
      resolve(await this.getProposalTemplate());
    });
  }

  async createTemplateField(
    fieldId: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField | null> {
    const [error, resultSet] = await to<ProposalQuestionRecord[]>(
      database
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
    );

    if (error) {
      this.logger.logException(
        "Exception occurred while inserting field",
        error,
        {
          topicId,
          dataType
        }
      );
      return null;
    }

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

    return createProposalTemplateFieldObject(resultSet[0]);
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
        return createProposalTemplateFieldObject(resultSet[0]);
      })
      .catch((e: Error) =>
        this.logger.logException(
          "Exception occurred while fetching template field",
          e,
          { fieldId }
        )
      );
  }

  async deleteTemplateField(fieldId: string): Promise<ProposalTemplate | null> {
    const [error] = await to(
      database("proposal_questions")
        .where({ proposal_question_id: fieldId })
        .del()
    );
    if (error) {
      this.logger.logException("Could not delete field", error, { fieldId });
      return null;
    }
    return await this.getProposalTemplate();
  }

  async deleteTopic(id: number): Promise<Topic | null> {
    return database("proposal_topics")
      .where({ topic_id: id })
      .del(["*"])
      .then((result: TopicRecord[]) => {
        if (!result || result.length !== 1) {
          this.logger.logError("Could not delete topic", { id });
          return null;
        }
        return createTopicObject(result[0]);
      })
      .catch((e: Error) => {
        this.logger.logException("Could not delete topic ", e, {
          id
        });
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
}
