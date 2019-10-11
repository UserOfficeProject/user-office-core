import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import {
  Proposal,
  ProposalAnswer,
  Topic,
  ProposalTemplateField,
  DataType,
  FieldDependency,
  FieldConfig,
  ProposalTemplate
} from "../models/Proposal";
import { UserAuthorization } from "../utils/UserAuthorization";
import { ILogger } from "../utils/Logger";

// TODO: it is here much of the logic reside

export default class ProposalMutations {

  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>,
    private logger: ILogger
  ) {}

  async createTopic(
    agent: User | null,
    title: string
  ): Promise<Topic | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return await this.dataSource.createTopic(title);
  }

  async updateTopic(
    agent: User | null,
    id: number,
    title?: string,
    isEnabled?: boolean
  ): Promise<Topic | Rejection> {
    // <--- wrap values in object here already
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return (
      (await this.dataSource.updateTopic(id, { title, isEnabled })) ||
      rejection("INTERNAL_SERVER_ERROR")
    );
  }

  async create(agent: User | null): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall())
        ) {
          return rejection("NO_ACTIVE_CALL_FOUND");
        }

        const result = await this.dataSource.create(agent.id);
        return result || rejection("INTERNAL_ERROR");
      },
      proposal => {
        return { type: "PROPOSAL_CREATED", proposal };
      }
    );
  }

  async update(
    agent: User | null,
    id: string,
    title?: string,
    abstract?: string,
    answers?: ProposalAnswer[],
    status?: number,
    users?: number[]
  ): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        // Get proposal information
        let proposal = await this.dataSource.get(parseInt(id)); //Hacky

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall())
        ) {
          return rejection("NO_ACTIVE_CALL_FOUND");
        }

        // Check that proposal exist
        if (!proposal) {
          return rejection("INTERNAL_ERROR");
        }

        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.userAuth.isMemberOfProposal(agent, proposal))
        ) {
          return rejection("NOT_ALLOWED");
        }
        if (
          (await this.userAuth.isMemberOfProposal(agent, proposal)) &&
          proposal.status !== 0
        ) {
          return rejection("NOT_ALLOWED_PROPOSAL_SUBMITTED");
        }

        if (title !== undefined) {
          proposal.title = title;

          if (title.length < 10) {
            return rejection("TOO_SHORT_TITLE");
          }
        }

        if (abstract !== undefined) {
          proposal.abstract = abstract;

          if (abstract.length < 20) {
            return rejection("TOO_SHORT_ABSTRACT");
          }
        }

        if (status !== undefined) {
          proposal.status = status;
        }

        if (users !== undefined) {
          const resultUpdateUsers = await this.dataSource.setProposalUsers(
            parseInt(id),
            users
          );
          if (!resultUpdateUsers) {
            return rejection("INTERNAL_ERROR");
          }
        }
        // This will overwrite the whole proposal with the new object created

        if (answers !== undefined) {
          // TODO validate input
          // if(<condition not matched>) { return rejection("<INVALID_VALUE_REASON>"); }
          answers.forEach(async answer => {
            if (answer.value !== undefined) {
              await this.dataSource.updateAnswer(
                proposal!.id,
                answer.proposal_question_id,
                answer.value
              );
            }
          });
        }

        const result = await this.dataSource.update(proposal);

        return result || rejection("INTERNAL_ERROR");
      },
      proposal => {
        return { type: "PROPOSAL_UPDATED", proposal };
      }
    );
  }

  async updateFiles(
    agent: User | null,
    proposalId: number,
    questionId: string,
    files: string[]
  ): Promise<string[] | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    let proposal = await this.dataSource.get(proposalId);

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection("NOT_ALLOWED");
    }

    await this.dataSource.deleteFiles(proposalId, questionId);

    const result = await this.dataSource.insertFiles(
      proposalId,
      questionId,
      files
    );

    return result || rejection("INTERNAL_ERROR");
  }

  async accept(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    const result = await this.dataSource.acceptProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
  }

  async reject(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }

    const result = await this.dataSource.rejectProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
  }

  async submit(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    let proposal = await this.dataSource.get(proposalId);

    if (!proposal) {
      return rejection("INTERNAL_ERROR");
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection("NOT_ALLOWED");
    }

    const result = await this.dataSource.submitProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
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
      const updatedField = await this.dataSource.updateField(field, {
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

  async deleteTemplateField(agent: User | null, id: string): Promise<ProposalTemplate | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return (
      (await this.dataSource.deleteTemplateField(
        id
      )) || rejection("INTERNAL_SERVER_ERROR")
    );
  }

  private createBlankConfig(dataType:DataType):FieldConfig {
    switch(dataType) {
      case DataType.FILE_UPLOAD:
          return {file_type:[]};
          case DataType.EMBELLISHMENT:
            return {"plain":"New embellishment","html":"<p>New embellishment</p>"};
      case DataType.SELECTION_FROM_OPTIONS:
        return {options:[]}
      default:
        return {};
    }
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
  ): Promise<ProposalTemplateField | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_AUTHORIZED");
    }
    return (
      (await this.dataSource.updateField(id, {
        dataType,
        sortOrder,
        question,
        topicId,
        config,
        dependencies
      })) || rejection("INTERNAL_SERVER_ERROR")
    );
  }
}
