import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { rejection, Rejection } from "../rejection";
import {
  Topic,
  ProposalTemplateField,
  DataType,
  FieldDependency,
  ProposalTemplate
} from "../models/ProposalModel";
import { UserAuthorization } from "../utils/UserAuthorization";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { ILogger, logger } from "../utils/Logger";
import { TemplateDataSource } from "../datasources/TemplateDataSource";
import {
  FieldConfigType,
  EmbellishmentConfig,
  SelectionFromOptionsConfig
} from "../resolvers/types/FieldConfig";
import { createConfig } from "../datasources/postgres/records";

export default class TemplateMutations {
  constructor(
    private dataSource: TemplateDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>,
    private logger: ILogger
  ) {}

  async createTopic(
    agent: User | null,
    sortOrder: number
  ): Promise<ProposalTemplate | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return this.dataSource
      .createTopic(sortOrder)
      .then(template => template)
      .catch(err => {
        logger.logException("Could not create topic", err, {
          agent,
          sortOrder
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async updateTopic(
    agent: User | null,
    id: number,
    title?: string,
    isEnabled?: boolean
  ): Promise<Topic | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return this.dataSource
      .updateTopic(id, {
        title,
        isEnabled
      })
      .then(topic => topic)
      .catch(err => {
        logger.logException("Could not update topic", err, {
          agent,
          id,
          title
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async deleteTopic(
    agent: User | null,
    topicId: number
  ): Promise<Topic | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }

    return this.dataSource
      .deleteTopic(topicId)
      .then(topic => topic)
      .catch(err => {
        logger.logException("Could not delete topic", err, { agent, topicId });
        return rejection("INTERNAL_ERROR");
      });
  }

  async createTemplateField(
    agent: User | null,
    topicId: number,
    dataType: DataType
  ): Promise<ProposalTemplateField | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    const newFieldId = `${dataType.toLowerCase()}_${new Date().getTime()}`;

    return this.dataSource
      .createTemplateField(
        newFieldId,
        topicId,
        dataType,
        "New question",
        JSON.stringify(this.createBlankConfig(dataType))
      )
      .then(template => template)
      .catch(err => {
        logger.logException("Could not create template field", err, {
          agent,
          topicId,
          dataType
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async updateProposalTemplateField(
    agent: User | null,
    id: string,
    dataType?: DataType,
    sortOrder?: number,
    question?: string,
    topicId?: number,
    config?: string,
    dependencies?: FieldDependency[]
  ): Promise<ProposalTemplate | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return this.dataSource
      .updateTemplateField(id, {
        dataType,
        sortOrder,
        question,
        topicId,
        config,
        dependencies
      })
      .then(template => template)
      .catch(err => {
        logger.logException("Could not update template field", err, {
          agent,
          id
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async deleteTemplateField(
    agent: User | null,
    id: string
  ): Promise<ProposalTemplate | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return this.dataSource
      .deleteTemplateField(id)
      .then(template => template)
      .catch(err => {
        logger.logException("Could not delete template field", err, {
          agent,
          id
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async updateTopicOrder(
    agent: User | null,
    topicOrder: number[]
  ): Promise<number[] | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return this.dataSource
      .updateTopicOrder(topicOrder)
      .then(order => order)
      .catch(err => {
        logger.logException("Could not update topic order", err, {
          agent,
          topicOrder
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async updateFieldTopicRel(
    agent: User | null,
    topicId: number,
    fieldIds: string[]
  ): Promise<string[] | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    var isSuccess = true;
    var index = 1;
    for (const field of fieldIds) {
      const updatedField = await this.dataSource.updateTemplateField(field, {
        topicId,
        sortOrder: index
      });
      isSuccess = isSuccess && updatedField != null;
      index++;
    }
    if (isSuccess === false) {
      return rejection("INTERNAL_ERROR");
    }
    return fieldIds;
  }

  private createBlankConfig(dataType: DataType): typeof FieldConfigType {
    switch (dataType) {
      case DataType.FILE_UPLOAD:
        return createConfig(DataType.FILE_UPLOAD, { file_type: [] });
      case DataType.EMBELLISHMENT:
        return createConfig<EmbellishmentConfig>(DataType.EMBELLISHMENT, {
          plain: "New embellishment",
          html: "<p>New embellishment</p>"
        });
      case DataType.SELECTION_FROM_OPTIONS:
        return createConfig<SelectionFromOptionsConfig>(
          DataType.SELECTION_FROM_OPTIONS,
          { options: [] }
        );
      default:
        return {};
    }
  }
}
