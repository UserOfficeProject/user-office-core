import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { rejection, Rejection } from "../rejection";
import {
  Topic,
  ProposalTemplateField,
  DataType,
  FieldDependency,
  FieldConfig,
  ProposalTemplate
} from "../models/ProposalModel";
import { UserAuthorization } from "../utils/UserAuthorization";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { ILogger } from "../utils/Logger";
import { TemplateDataSource } from "../datasources/TemplateDataSource";

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
    return await this.dataSource.createTopic(sortOrder);
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
    return (
      (await this.dataSource.updateTopic(id, {
        title,
        isEnabled
      })) || rejection("INTERNAL_SERVER_ERROR")
    );
  }

  async deleteTopic(
    agent: User | null,
    topicId: number
  ): Promise<Topic | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }

    var result = await this.dataSource.deleteTopic(topicId);
    return result ? result : rejection("INTERNAL_ERROR");
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

    return (
      (await this.dataSource.createTemplateField(
        newFieldId,
        topicId,
        dataType,
        "New question",
        JSON.stringify(this.createBlankConfig(dataType))
      )) || rejection("INTERNAL_SERVER_ERROR")
    );
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
    return (
      (await this.dataSource.updateTemplateField(id, {
        dataType,
        sortOrder,
        question,
        topicId,
        config,
        dependencies
      })) || rejection("INTERNAL_SERVER_ERROR")
    );
  }

  async deleteTemplateField(
    agent: User | null,
    id: string
  ): Promise<ProposalTemplate | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return (
      (await this.dataSource.deleteTemplateField(id)) ||
      rejection("INTERNAL_SERVER_ERROR")
    );
  }

  async updateTopicOrder(
    agent: User | null,
    topicOrder: number[]
  ): Promise<Boolean | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return (
      (await this.dataSource.updateTopicOrder(topicOrder)) ||
      rejection("INTERNAL_SERVER_ERROR")
    );
  }

  async updateFieldTopicRel(
    agent: User | null,
    topicId: number,
    fieldIds: string[]
  ): Promise<void | Rejection> {
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
  }

  private createBlankConfig(dataType: DataType): FieldConfig {
    switch (dataType) {
      case DataType.FILE_UPLOAD:
        return { file_type: [] };
      case DataType.EMBELLISHMENT:
        return {
          plain: "New embellishment",
          html: "<p>New embellishment</p>"
        };
      case DataType.SELECTION_FROM_OPTIONS:
        return { options: [] };
      default:
        return {};
    }
  }
}
