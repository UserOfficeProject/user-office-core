import { container, inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { rejection, Rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';
import { UpdateEsiArgs } from '../resolvers/mutations/UpdateEsiMutation';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';

@injectable()
export default class ProposalEsiMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    private dataSource: ProposalEsiDataSource,
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async createEsi(
    user: UserWithRole | null,
    scheduledEventId: number
  ): Promise<ExperimentSafetyInput | Rejection> {
    const scheduledEvent =
      await this.scheduledEventDataSource.getScheduledEventCore(
        scheduledEventId
      );
    if (!scheduledEvent?.proposalPk) {
      return rejection(
        'Can not create ESI, because scheduled event does not exist or has no proposal attached to it'
      );
    }

    const proposal = await this.proposalDataSource.get(
      scheduledEvent.proposalPk
    );
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

    return this.dataSource.createEsi(
      scheduledEventId,
      newQuestionaryId,
      user!.id
    );
  }

  @Authorized()
  async updateEsi(
    user: UserWithRole | null,
    args: UpdateEsiArgs
  ): Promise<ExperimentSafetyInput | Rejection> {
    if (args.isSubmitted === false && !this.userAuth.isUserOfficer(user)) {
      return rejection(
        'Can not update ESI, it is not allowed to change ESI once it has been submitted'
      );
    }

    return this.dataSource.updateEsi(args);
  }
}
