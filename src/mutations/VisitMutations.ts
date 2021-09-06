import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized } from '../decorators';
import { ProposalEndStatus } from '../models/Proposal';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { Visit, VisitStatus } from '../models/Visit';
import { VisitRegistration } from '../models/VisitRegistration';
import { CreateVisitArgs } from '../resolvers/mutations/CreateVisitMutation';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../resolvers/mutations/UpdateVisitRegistration';
import { UserAuthorization } from '../utils/UserAuthorization';
import { VisitAuthorization } from './../utils/VisitAuthorization';

@injectable()
export default class VisitMutations {
  constructor(
    @inject(Tokens.VisitDataSource)
    private dataSource: VisitDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.VisitAuthorization)
    private visitAuthorization: VisitAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  @Authorized()
  async createVisit(
    user: UserWithRole | null,
    args: CreateVisitArgs
  ): Promise<Visit | Rejection> {
    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection('Can not create visit, proposal does not exist', {
        args,
        agent: user,
      });
    }

    if (
      proposal.finalStatus !== ProposalEndStatus.ACCEPTED ||
      proposal.managementDecisionSubmitted === false
    ) {
      return rejection(
        'Can not create visit, the proposal is not yet accepted',
        {
          args,
          agent: user,
        }
      );
    }

    const visitAlreadyExists =
      (
        await this.dataSource.getVisits({
          scheduledEventId: args.scheduledEventId,
        })
      ).length > 0;

    if (visitAlreadyExists) {
      return rejection(
        'Can not create visit because visit for the experiment that already exists',
        { args }
      );
    }

    const isProposalOwner = await this.userAuthorization.hasAccessRights(
      user,
      proposal
    );
    if (isProposalOwner === false) {
      return rejection(
        'Can not create visit for proposal that does not belong to you',
        { args, agent: user }
      );
    }

    // TODO verify that provided scheduledEventId exists
    try {
      const visit = await this.dataSource.createVisit(args, user!.id);

      if (args.team && args.team.length > 0) {
        await this.dataSource.updateVisit({
          visitId: visit.id,
          team: args.team,
        });
      }

      return visit;
    } catch (error) {
      return rejection(
        'Could not create visit because of an error',
        { args },
        error
      );
    }
  }

  @Authorized()
  async updateVisit(
    user: UserWithRole | null,
    args: UpdateVisitArgs
  ): Promise<Visit | Rejection> {
    if (!user) {
      return rejection(
        'Could not update visit because request is not authorized',
        { args }
      );
    }
    const visit = await this.dataSource.getVisit(args.visitId);

    if (!visit) {
      return rejection(
        'Could not update visit because specified visit does not exist',
        { args }
      );
    }

    const hasRights = await this.visitAuthorization.hasWriteRights(user, visit);

    if (
      this.userAuthorization.isUser(user) &&
      args.status === VisitStatus.ACCEPTED
    ) {
      return rejection(
        'Can not update visit status because of insufficient permissions'
      );
    }

    if (hasRights === false) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { args, agent: user }
      );
    }

    return this.dataSource.updateVisit(args);
  }

  @Authorized()
  async deleteVisit(
    user: UserWithRole | null,
    visitId: number
  ): Promise<Visit | Rejection> {
    const hasRights = await this.visitAuthorization.hasWriteRights(
      user,
      visitId
    );
    if (hasRights === false) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { user, visitId }
      );
    }

    return this.dataSource.deleteVisit(visitId);
  }
  @Authorized()
  async createVisitRegistrationQuestionary(
    user: UserWithRole | null,
    visitId: number
  ): Promise<VisitRegistration | Rejection> {
    if (!user) {
      return rejection(
        'Can not create visit registration questionary, because the request is not authorized'
      );
    }

    if (!visitId) {
      return rejection(
        'Can not create visit registration questionary, visit id not specified'
      );
    }

    const activeTemplate = await this.templateDataSource.getActiveTemplateId(
      TemplateCategoryId.VISIT
    );
    if (!activeTemplate) {
      return rejection(
        'Could not create visit registration questionary, because no active template for visit is set',
        { visitId }
      );
    }
    const questionary = await this.questionaryDataSource.create(
      user.id,
      activeTemplate
    );

    return this.dataSource.updateRegistration(user.id, {
      visitId: visitId,
      registrationQuestionaryId: questionary.questionaryId,
    });
  }

  @Authorized()
  async updateVisitRegistration(
    user: UserWithRole | null,
    args: UpdateVisitRegistrationArgs
  ): Promise<any> {
    if (!user) {
      return null;
    }

    return this.dataSource.updateRegistration(user.id, args);
  }
}
