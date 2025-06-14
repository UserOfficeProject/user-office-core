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
import { ExperimentHasSample, ExperimentStatus } from '../models/Experiment';
import { rejection, Rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';
import { AddSampleToExperimentInput } from '../resolvers/mutations/AddSampleToExperimentMutation';
import { CloneExperimentSampleInput } from '../resolvers/mutations/CloneExperimentSampleMutation';
import { RemoveSampleFromExperimentInput } from '../resolvers/mutations/RemoveSampleFromExperimentMutation';
import { SubmitExperimentSafetyArgs } from '../resolvers/mutations/SubmitExperimentSafetyMutation';
import { UpdateExperimentSampleInput } from '../resolvers/mutations/UpdateExperimentSampleMutation';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';
import { SampleDeclarationConfig } from '../resolvers/types/FieldConfig';
import { CloneUtils } from '../utils/CloneUtils';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';

@injectable()
export default class ExperimentMutations {
  private experimentSafetyAuth = container.resolve(
    ExperimentSafetyAuthorization
  );
  private cloneUtils = container.resolve(CloneUtils);

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
  async createOrGetExperimentSafety(
    agent: UserWithRole | null,
    experimentPk: number
  ): Promise<ExperimentSafety | Rejection> {
    const experiment = await this.dataSource.getExperiment(experimentPk);

    if (!experiment) {
      return rejection(
        'Can not create Experiment Safety, because experiment does not exist'
      );
    }

    // Check if the Proposal exists
    const proposal = await this.proposalDataSource.get(experiment.proposalPk);
    if (!proposal) {
      return rejection(
        'Can not create Experiment Safety for an experiment that is not connected to a valid Proposal'
      );
    }

    // Check the authenticity of the User
    const canReadProposal =
      this.userAuth.isApiToken(agent) ||
      (await this.proposalAuth.hasReadRights(agent, proposal));
    if (canReadProposal === false) {
      return rejection(
        'User is not authorized to create Experiment Safety for this experiment'
      );
    }

    // Check if the Experiment is completed
    if (experiment.status !== ExperimentStatus.ACTIVE) {
      return rejection(
        'Can not create Experiment Safety, because the experiment is not active'
      );
    }

    // Cannot create Experiment Safety if the Experiment is Active, but already started
    if (experiment.startsAt < new Date()) {
      return rejection(
        'Can not create Experiment Safety, because the experiment has already started'
      );
    }

    const experimentSafety =
      await this.dataSource.getExperimentSafetyByExperimentPk(experimentPk);

    if (experimentSafety) {
      return experimentSafety;
    }

    const call = (await this.callDataSource.getCall(proposal.callId))!;
    if (!call.esiTemplateId) {
      return rejection(
        'Can not create Experiment Safety, because system has no Experiment Safety template configured'
      );
    }
    const newQuestionary = await this.questionaryDataSource.create(
      agent!.id,
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
      agent!.id
    );
  }

  @Authorized()
  async submitExperimentSafety(
    agent: UserWithRole | null,
    args: SubmitExperimentSafetyArgs
  ): Promise<ExperimentSafety | Rejection> {
    if (
      args.isSubmitted === false &&
      !(this.userAuth.isApiToken(agent) || this.userAuth.isUserOfficer(agent))
    ) {
      return rejection(
        'Can not update Experiment Safety, it is not allowed to change Experiment Safety once it has been submitted'
      );
    }

    return this.dataSource.submitExperimentSafety(args);
  }

  @Authorized()
  async addSampleToExperiment(
    agent: UserWithRole | null,
    args: AddSampleToExperimentInput
  ): Promise<ExperimentHasSample | Rejection> {
    const experiment = await this.dataSource.getExperiment(args.experimentPk);
    if (!experiment) {
      return rejection('No experiment found');
    }

    const proposal = await this.proposalDataSource.get(experiment.proposalPk);
    if (!proposal) {
      return rejection('No proposal found', { args });
    }

    const proposalQuestionary = await this.questionaryDataSource.getQuestionary(
      proposal.questionaryId
    );
    if (!proposalQuestionary) {
      return rejection('No proposal questionary found', { args });
    }

    const experimentSafety =
      await this.dataSource.getExperimentSafetyByExperimentPk(
        args.experimentPk
      );

    if (!experimentSafety) {
      return rejection('No experiment safety found', { args });
    }

    const hasAccessRights =
      this.userAuth.isApiToken(agent) ||
      (await this.experimentSafetyAuth.hasWriteRights(
        agent,
        experimentSafety.experimentSafetyPk
      ));
    if (hasAccessRights === false) {
      return rejection(
        'User does not have permission to attach samples to the experiment',
        {
          args,
        }
      );
    }

    const sample = await this.sampleDataSource.getSample(args.sampleId);
    if (!sample) {
      return rejection('No sample found', { args });
    }

    const questionTemplateRel =
      await this.templateDataSource.getQuestionTemplateRelation(
        sample.questionId,
        proposalQuestionary.templateId
      );
    if (!questionTemplateRel) {
      return rejection('No question found', { args });
    }

    const templateId = (questionTemplateRel.config as SampleDeclarationConfig)
      .esiTemplateId;
    if (!templateId) {
      return rejection('Esi template is not defined', { args });
    }

    const newQuestionary = await this.questionaryDataSource.create(
      agent!.id,
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

  @Authorized()
  async removeSampleFromExperiment(
    agent: UserWithRole | null,
    args: RemoveSampleFromExperimentInput
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

    const hasAccessRights =
      this.userAuth.isApiToken(agent) ||
      (await this.experimentSafetyAuth.hasWriteRights(
        agent,
        experimentSafety.experimentSafetyPk
      ));
    if (hasAccessRights === false) {
      return rejection(
        'User does not have permission to remove samples from the experiment',
        {
          args,
        }
      );
    }

    return this.dataSource.removeSampleFromExperiment(
      args.experimentPk,
      args.sampleId
    );
  }

  @Authorized()
  async updateExperimentSample(
    agent: UserWithRole | null,
    args: UpdateExperimentSampleInput
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

    const hasAccessRights =
      this.userAuth.isApiToken(agent) ||
      (await this.experimentSafetyAuth.hasWriteRights(
        agent,
        experimentSafety.experimentSafetyPk
      ));
    if (!hasAccessRights) {
      return rejection(
        'User does not have permission to update samples in the experiment',
        {
          args,
        }
      );
    }

    return this.dataSource.updateExperimentSample(
      args.experimentPk,
      args.sampleId,
      !!args.isSubmitted
    );
  }

  @Authorized()
  async cloneExperimentSample(
    agent: UserWithRole | null,
    args: CloneExperimentSampleInput
  ): Promise<ExperimentHasSample | Rejection> {
    const experimentSample = await this.dataSource.getExperimentSample(
      args.experimentPk,
      args.sampleId
    );
    if (!experimentSample) {
      return rejection('No experiment sample found');
    }

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

    const hasAccessRights =
      this.userAuth.isApiToken(agent) ||
      (await this.experimentSafetyAuth.hasWriteRights(
        agent,
        experimentSafety.experimentSafetyPk
      ));
    if (!hasAccessRights) {
      return rejection(
        'User does not have permission to clone samples in the experiment',
        {
          args,
        }
      );
    }

    return this.cloneUtils.cloneExperimentSample(experimentSample, {
      experimentSafety: {
        isEsiSubmitted: false,
      },
      sample: {
        isPostProposalSubmission: true,
        title: args.newSampleTitle,
      },
    });
  }
}
