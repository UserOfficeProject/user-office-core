import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { ProposalStatusDefaultShortCodes } from '../models/ProposalStatus';
import { rejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateSampleInput } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleArgs } from '../resolvers/mutations/UpdateSampleMutation';
import { CloneUtils } from '../utils/CloneUtils';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ProposalSettingsDataSource } from './../datasources/ProposalSettingsDataSource';
import { CloneSampleInput } from './../resolvers/mutations/CloneSampleMutation';
import { UserAuthorization } from './../utils/UserAuthorization';

@injectable()
export default class SampleMutations {
  private userAuth = container.resolve(UserAuthorization);
  private sampleAuth = container.resolve(SampleAuthorization);
  private cloneUtils = container.resolve(CloneUtils);

  constructor(
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource
  ) {}

  @Authorized()
  async createSample(agent: UserWithRole | null, args: CreateSampleInput) {
    if (!agent) {
      return rejection('Can not create sample because user is not authorized', {
        agent,
        args,
      });
    }

    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (template?.groupId !== TemplateGroupId.SAMPLE) {
      return rejection('Can not create sample with this template', {
        agent,
        args,
      });
    }

    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection('Can not create sample because proposal was not found', {
        agent,
        args,
      });
    }

    if ((await this.userAuth.hasAccessRights(agent, proposal)) === false) {
      return rejection(
        'Can not create sample because of insufficient permissions',
        { agent, args }
      );
    }

    if (proposal.submitted && args.isPostProposalSubmission !== true) {
      return rejection(
        'Can not create sample because proposal is already submitted',
        { agent, args }
      );
    }

    const sampleQuestionary = await this.questionaryDataSource.create(
      agent.id,
      args.templateId
    );

    let newSample = await this.sampleDataSource.create(
      args.title,
      agent.id,
      args.proposalPk,
      sampleQuestionary.questionaryId,
      args.questionId
    );
    if (args.isPostProposalSubmission) {
      newSample = await this.sampleDataSource.updateSample({
        sampleId: newSample.id,
        isPostProposalSubmission: args.isPostProposalSubmission,
      });
    }

    return newSample;
  }

  @EventBus(Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED)
  async updateSample(agent: UserWithRole | null, args: UpdateSampleArgs) {
    const hasWriteRights = await this.sampleAuth.hasWriteRights(
      agent,
      args.sampleId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not update sample because of insufficient permissions',
        { agent, args }
      );
    }

    // This makes sure administrative fields can be only updated by user with the right role
    if (args.safetyComment || args.safetyStatus) {
      const canAdministrerSample =
        this.userAuth.isUserOfficer(agent) ||
        (await this.userAuth.isSampleSafetyReviewer(agent));
      if (canAdministrerSample === false) {
        delete args.safetyComment;
        delete args.safetyStatus;
      }
    }

    return this.sampleDataSource
      .updateSample(args)
      .then((sample) => sample)
      .catch((error) => {
        return rejection(
          'Can not update sample because an error occurred',
          { agent, args },
          error
        );
      });
  }

  async deleteSample(agent: UserWithRole | null, sampleId: number) {
    const sample = await this.sampleDataSource.getSample(sampleId);
    if (sample === null) {
      return rejection(
        'Could not delete sample because sample with specified ID does not exist',
        { agent, sampleId }
      );
    }
    const hasWriteRights = await this.sampleAuth.hasWriteRights(agent, sample);

    if (hasWriteRights === false) {
      return rejection(
        'Can not delete sample because of insufficient permissions',
        { agent, sampleId }
      );
    }

    const proposal = await this.proposalDataSource.get(sample.proposalPk);
    if (proposal!.submitted && sample.isPostProposalSubmission === false) {
      return rejection(
        'Could not delete sample because associated proposal is already submitted',
        { agent, sampleId }
      );
    }

    return this.sampleDataSource
      .delete(sampleId)
      .then((sample) => sample)
      .catch((error) => {
        return rejection(
          'Can not delete sample because an error occurred',
          { agent, sampleId },
          error
        );
      });
  }

  @Authorized()
  async cloneSample(agent: UserWithRole | null, args: CloneSampleInput) {
    const { sampleId, title, isPostProposalSubmission } = args;
    if (!agent) {
      return rejection(
        'Could not clone sample because user is not authorized',
        { agent, args }
      );
    }

    const sourceSample = await this.sampleDataSource.getSample(sampleId);
    if (!sourceSample) {
      return rejection(
        'Could not clone sample, because source sample does not exist',
        { agent, args }
      );
    }

    if (!(await this.sampleAuth.hasWriteRights(agent, sourceSample))) {
      return rejection(
        'Could not clone sample, because of insufficient permissions',
        { agent, args }
      );
    }

    const proposal = await this.proposalDataSource.get(sourceSample.proposalPk);
    if (!proposal) {
      return rejection(
        'Could not clone sample, because proposal does not exist',
        { agent, args }
      );
    }

    // TODO Move this logic into commonly shared place ProposalAuthorizer SWAP-1944
    const proposalStatus =
      await this.proposalSettingsDataSource.getProposalStatus(
        proposal.statusId
      );

    if (
      proposalStatus?.shortCode !==
      ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED
    ) {
      if (
        proposal.submitted &&
        isPostProposalSubmission !== true &&
        !this.userAuth.isUserOfficer(agent)
      ) {
        return rejection('Can not update proposal after submission');
      }
    }

    try {
      return this.cloneUtils.cloneSample(sourceSample, { title });
    } catch (error) {
      return rejection(
        'Could not clone sample because an error occurred',
        { agent, sampleId },
        error
      );
    }
  }
}
