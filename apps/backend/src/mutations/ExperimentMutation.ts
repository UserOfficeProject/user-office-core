import { container, inject, injectable } from 'tsyringe';

import { ExperimentSafetyAuthorization } from '../auth/ExperimentSafetyAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { ExperimentHasSample } from '../models/Experiment';
import { rejection, Rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';
import { AddSampleToExperimentInput } from '../resolvers/mutations/AddSampleToExperimentMutation';
import { UpdateExperimentSafetyArgs } from '../resolvers/mutations/UpdateExperimentSafetyMutation';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';
import { SampleDeclarationConfig } from '../resolvers/types/FieldConfig';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';

@injectable()
export default class ExperimentMutations {
  private experimentSafetyAuth = container.resolve(
    ExperimentSafetyAuthorization
  );
  constructor(
    @inject(Tokens.ExperimentDataSource)
    private dataSource: ExperimentDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  @Authorized()
  async createExperimentSafety(
    user: UserWithRole | null,
    experimentPk: number
  ): Promise<ExperimentSafety | Rejection> {
    const experiment = await this.dataSource.getExperiment(experimentPk);

    if (!experiment) {
      return rejection(
        'Can not create Experiment Safety, because experiment does not exist'
      );
    }

    const proposal = await this.proposalDataSource.get(experiment.proposalPk);
    if (!proposal) {
      return rejection('Can not create ESI, because proposal does not exist');
    }

    const canReadProposal = await this.proposalAuth.hasReadRights(
      user,
      proposal
    );
    if (canReadProposal === false) {
      return rejection(
        'User is not authorized to create ESI for this proposal'
      );
    }

    const call = (await this.callDataSource.getCall(proposal.callId))!;

    if (!call.esiTemplateId) {
      return rejection(
        'Can not create ESI, because system has no ESI template configured'
      );
    }

    const newQuestionary = await this.questionaryDataSource.create(
      user!.id,
      call.esiTemplateId
    );
    const newQuestionaryId = newQuestionary.questionaryId;

    await this.questionaryDataSource.copyAnswers(
      proposal.questionaryId,
      newQuestionaryId
    );

    return await this.dataSource.createExperimentSafety(
      experimentPk,
      newQuestionaryId,
      user!.id
    );
  }

  @Authorized()
  async updateExperimentSafety(
    user: UserWithRole | null,
    args: UpdateExperimentSafetyArgs
  ): Promise<ExperimentSafety | Rejection> {
    if (args.isSubmitted === false && !this.userAuth.isUserOfficer(user)) {
      return rejection(
        'Can not update ESI, it is not allowed to change ESI once it has been submitted'
      );
    }

    return this.dataSource.updateExperimentSafety(args);
  }

  @Authorized()
  async addSampleToExperiment(
    user: UserWithRole | null,
    args: AddSampleToExperimentInput
  ): Promise<ExperimentHasSample | Rejection> {
    const experiment = await this.dataSource.getExperiment(args.experimentPk);
    if (!experiment) {
      return rejection('No experiment found');
    }

    const experimentSafety =
      await this.dataSource.getExperimentSafetyByExperimentPk(
        args.experimentPk
      );

    if (!experimentSafety) {
      return rejection('No experiment safety found');
    }

    const hasAccessRights = await this.experimentSafetyAuth.hasWriteRights(
      user,
      experimentSafety.experimentSafetyPk
    );
    if (hasAccessRights === false) {
      return rejection('User does not have permission to attach samples', {
        args,
      });
    }

    const sample = await this.sampleDataSource.getSample(args.sampleId);
    if (!sample) {
      return rejection('No sample found');
    }

    const question = await this.templateDataSource.getQuestion(
      sample.questionId
    ); // TODO this should be a getQuestionTemplateRelation. There is no way currently of doing it. Sample should reference QuestionRel instead of Question
    if (!question) {
      return rejection('No question found');
    }

    const templateId = (question.config as SampleDeclarationConfig)
      .esiTemplateId;
    if (!templateId) {
      return rejection('Esi template is not defined');
    }
    const newQuestionary = await this.questionaryDataSource.create(
      user!.id,
      templateId!
    );

    await this.questionaryDataSource.copyAnswers(
      sample.questionaryId,
      newQuestionary.questionaryId
    );

    return this.dataSource.addSampleToExperiment(
      args.experimentPk,
      args.sampleId,
      newQuestionary.questionaryId
    );
  }
}
