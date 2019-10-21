import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
import {
  ProposalTemplate,
  Proposal,
  ProposalAnswer,
  Questionary,
  QuestionaryStep,
  QuestionaryField
} from "../models/Proposal";
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
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    if ((await this.hasAccessRights(agent, proposal)) === false) {
      return null;
    }

    const template = await this.dataSource.getProposalTemplate();
    const answers = await this.dataSource.getProposalAnswers(id);

    var answerRef = JSDict.Create<string, ProposalAnswer>();
    answers.forEach(answer => {
      answerRef.put(answer.proposal_question_id, answer);
    });

    const questionarySteps = Array<QuestionaryStep>();
    template.steps.forEach(templateStep => {
      const questionaryFields = Array<QuestionaryField>();
      templateStep.fields.forEach(field => {
        const answer = answerRef.get(field.proposal_question_id);
        questionaryFields.push({
          ...field,
          value: answer ? answer.value : undefined
        });
      });
      questionarySteps.push(
        new QuestionaryStep(templateStep.topic, false, questionaryFields)
      );
    });

    return new Questionary(questionarySteps);
  }

  async getProposalTemplate(
    agent: User | null
  ): Promise<ProposalTemplate | null> {
    if (agent == null) {
      return null;
    }

    return await this.dataSource.getProposalTemplate();
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
}
