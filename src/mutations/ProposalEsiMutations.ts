import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized } from '../decorators';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { rejection, Rejection } from '../models/Rejection';
import { UserWithRole } from '../models/User';
import { CreateEsiArgs } from '../resolvers/mutations/CreateEsiMutation';
import { UpdateEsiArgs } from '../resolvers/mutations/UpdateEsiMutation';
import { EsiAuthorization } from '../utils/EsiAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class ProposalEsiMutations {
  private esiAuth = container.resolve(EsiAuthorization);
  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    private dataSource: ProposalEsiDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async createEsi(
    user: UserWithRole | null,
    args: CreateEsiArgs
  ): Promise<ExperimentSafetyInput | Rejection> {
    const visit = await this.visitDataSource.getVisit(args.visitId);
    if (!visit) {
      return rejection(
        'Can not create ESI, because visit with provided ID does not exist'
      );
    }

    const proposal = await this.proposalDataSource.get(visit.proposalPk);
    if (!proposal) {
      return rejection('Can not create ESI, because proposal does not exist');
    }

    const hasAccessRights = await this.userAuth.hasAccessRights(user, proposal);
    if (!hasAccessRights) {
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

    return this.dataSource.createEsi({
      ...args,
      questionaryId: newQuestionaryId,
      creatorId: user!.id,
    });
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
