import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { Authorized } from '../decorators';
import { rejection, Rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';
import { UpdateExperimentSafetyArgs } from '../resolvers/mutations/UpdateExperimentSafetyMutation';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';

@injectable()
export default class ExperimentMutations {
  constructor(
    @inject(Tokens.ExperimentDataSource)
    private dataSource: ExperimentDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
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
}
