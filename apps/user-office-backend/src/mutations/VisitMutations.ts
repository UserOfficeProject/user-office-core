import { container, inject, injectable } from 'tsyringe';

import { VisitAuthorization } from '../auth/VisitAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized } from '../decorators';
import { ProposalEndStatus } from '../models/Proposal';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { Visit, VisitStatus } from '../models/Visit';
import { VisitRegistration } from '../models/VisitRegistration';
import { CreateVisitArgs } from '../resolvers/mutations/CreateVisitMutation';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../resolvers/mutations/UpdateVisitRegistration';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';
import { UserAuthorization } from './../auth/UserAuthorization';

@injectable()
export default class VisitMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private visitAuth = container.resolve(VisitAuthorization);

  constructor(
    @inject(Tokens.VisitDataSource)
    private dataSource: VisitDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async createVisit(
    user: UserWithRole | null,
    args: CreateVisitArgs
  ): Promise<Visit | Rejection> {
    const visitAlreadyExists =
      (
        await this.dataSource.getVisits({
          scheduledEventId: args.scheduledEventId,
        })
      ).length > 0;

    if (visitAlreadyExists === true) {
      return rejection(
        'Can not create visit because visit for the experiment that already exists',
        { args }
      );
    }

    const scheduledEvent =
      await this.scheduledEventDataSource.getScheduledEventCore(
        args.scheduledEventId
      );
    if (!scheduledEvent) {
      return rejection(
        'Can not create visit because scheduled event does not exist',
        {
          args,
          agent: user,
        }
      );
    }

    if (scheduledEvent.proposalPk === null) {
      return rejection(
        'Can not create visit because scheduled event does not have a proposal associated with',
        {
          args,
          agent: user,
        }
      );
    }

    const proposal = await this.proposalDataSource.get(
      scheduledEvent.proposalPk
    );

    if (proposal === null) {
      return rejection(
        'Can not create visit, proposal for the scheduled event does not exist',
        {
          args,
          agent: user,
        }
      );
    }

    if (
      proposal.finalStatus !== ProposalEndStatus.ACCEPTED ||
      proposal.managementDecisionSubmitted === false
    ) {
      return rejection(
        'Can not create visit because the proposal is not yet accepted',
        {
          args,
          agent: user,
        }
      );
    }

    const isProposalOwner = await this.proposalAuth.hasReadRights(
      user,
      proposal
    );
    if (isProposalOwner === false) {
      return rejection(
        'Can not create visit for proposal that does not belong to you',
        { args, agent: user }
      );
    }

    const isTeamleadPartOfTheTeam = args.team.some(
      (teamMember) => teamMember === args.teamLeadUserId
    );

    if (isTeamleadPartOfTheTeam === false) {
      return rejection(
        'Can not create visit because team lead is not part of the team',
        {
          args,
          agent: user,
        }
      );
    }
    try {
      const visit = await this.dataSource.createVisit(
        args,
        user!.id,
        proposal.primaryKey
      );

      if (args.team && args.team.length > 0) {
        await this.dataSource.updateVisit({
          visitId: visit.id,
          team: args.team,
          teamLeadUserId: args.teamLeadUserId,
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

    const hasRights = await this.visitAuth.hasWriteRights(user, visit);

    if (this.userAuth.isUser(user) && args.status === VisitStatus.ACCEPTED) {
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
    const hasRights = await this.visitAuth.hasWriteRights(user, visitId);
    if (hasRights === false) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { user, visitId }
      );
    }

    return this.dataSource.deleteVisit(visitId);
  }
  @Authorized()
  async createVisitRegistration(
    user: UserWithRole | null,
    visitId: number
  ): Promise<VisitRegistration | Rejection> {
    if (!user) {
      return rejection(
        'Can not create visit registration, because the request is not authorized'
      );
    }

    if (!visitId) {
      return rejection(
        'Can not create visit registration, visit id not specified'
      );
    }

    const activeTemplate = await this.templateDataSource.getActiveTemplateId(
      TemplateGroupId.VISIT_REGISTRATION
    );
    if (!activeTemplate) {
      return rejection(
        'Could not create visit registration, because no active template for visit is set',
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
  ): Promise<VisitRegistration | null> {
    if (!user) {
      return null;
    }

    // TODO implement visitRegistrationAuth and perform checks there
    if (this.userAuth.isUserOfficer(user) !== true) {
      delete args.trainingExpiryDate;
      if (args.isRegistrationSubmitted === false) {
        delete args.isRegistrationSubmitted;
      }
    }

    return this.dataSource.updateRegistration(user.id, args);
  }
}
