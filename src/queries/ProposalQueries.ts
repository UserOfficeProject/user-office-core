import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
import {
  ProposalTemplate,
  Proposal,
  ProposalTemplateField
} from "../models/Proposal";
import { Rejection, rejection, isRejection } from "../rejection";
import { ILogger } from "../utils/Logger";
import JSDict from "../utils/Dictionary";

export default class ProposalQueries {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization,
    private logger: ILogger
  ) {}

  async get(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  async getQuestionary(agent: User, id: number) {
    const template = await this.getProposalTemplate(agent);
    const answers = await this.getAnswers(agent, id);

    if (isRejection(template)) {
      this.logger.logWarn("Unauthorized access", { agent });
      return template; // rejection
    }

    if (isRejection(answers)) {
      this.logger.logWarn("Unauthorized access", { agent });
      return answers; // rejection
    }

    var answerRef = JSDict.Create<string, ProposalTemplateField>();
    answers.forEach(answer => {
      answerRef[answer.proposal_question_id] = answer;
    })
    template.topics.forEach(topic => {
      topic.fields.forEach(field => {
        if(answerRef[field.proposal_question_id])
        {
          field.value = answerRef[field.proposal_question_id].value;
        }
      });
    });

    return template;    
  }

  async getAnswers(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return rejection("Proposal does not exist");
    }

    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return await this.dataSource.getProposalAnswers(proposal.id);
    } else {
      return rejection("Not allowed");
    }
  }

  private async hasAccessRights(
    agent: User | null,
    proposal: Proposal
  ): Promise<boolean> {
    return (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isMemberOfProposal(agent, proposal)) ||
      (await this.userAuth.isReviewerOfProposal(agent, proposal.id))
    );
  }

  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposals(filter, first, offset);
    } else {
      return null;
    }
  }

  async getProposalTemplate(
    agent: User | null
  ): Promise<ProposalTemplate | Rejection> {
    if (agent == null) {
      return rejection("Not authorized");
    }

    return await this.dataSource.getProposalTemplate();
  }
}
