import { container, inject, injectable } from 'tsyringe';

import { VisitAuthorization } from '../auth/VisitAuthorization';
import { VisitRegistrationAuthorization } from '../auth/VisitRegistrationAuthorization';
import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized, EventBus } from '../decorators';
import { resolveApplicationEventBus } from '../events';
import { Event } from '../events/event.enum';
import { ProposalEndStatus } from '../models/Proposal';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { Visit } from '../models/Visit';
import {
  VisitRegistration,
  VisitRegistrationStatus,
} from '../models/VisitRegistration';
import { ApproveVisitRegistrationInput } from '../resolvers/mutations/ApproveVisitRegistrationMutations';
import { CancelVisitRegistrationInput } from '../resolvers/mutations/CancelVisitRegistrationMutation';
import { CreateVisitArgs } from '../resolvers/mutations/CreateVisitMutation';
import { SubmitVisitRegistrationArgs } from '../resolvers/mutations/SubmitVisitRegistration';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../resolvers/mutations/UpdateVisitRegistrationMutation';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';
import { UserAuthorization } from './../auth/UserAuthorization';
@injectable()
export default class VisitMutations {
  private visitAuth = container.resolve(VisitAuthorization);
  private registrationAuth = container.resolve(VisitRegistrationAuthorization);

  constructor(
    @inject(Tokens.VisitDataSource)
    private dataSource: VisitDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  @Authorized()
  async createVisit(
    agent: UserWithRole | null,
    args: CreateVisitArgs
  ): Promise<Visit | Rejection> {
    const visitAlreadyExists =
      (
        await this.dataSource.getVisits({
          experimentPk: args.experimentPk,
        })
      ).length > 0;

    if (visitAlreadyExists === true) {
      return rejection(
        'Can not create visit because visit for the experiment that already exists',
        { args }
      );
    }

    const experiment = await this.experimentDataSource.getExperiment(
      args.experimentPk
    );

    if (!experiment) {
      return rejection(
        'Can not create visit because experiment does not exist',
        {
          args,
          agent,
        }
      );
    }

    const proposal = await this.proposalDataSource.get(experiment.proposalPk);

    if (proposal === null) {
      return rejection(
        'Can not create visit, proposal for the scheduled event does not exist',
        {
          args,
          agent,
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
          agent,
        }
      );
    }

    const hasReadRights =
      this.userAuth.isApiToken(agent) ||
      (await this.proposalAuth.hasReadRights(agent, proposal));
    if (hasReadRights === false) {
      return rejection(
        'Can not create visit for proposal that does not belong to you',
        { args, agent }
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
          agent,
        }
      );
    }
    try {
      const visit = await this.dataSource.createVisit(
        args,
        agent!.id,
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
    agent: UserWithRole | null,
    args: UpdateVisitArgs
  ): Promise<Visit | Rejection> {
    if (!agent) {
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

    const hasRights =
      this.userAuth.isApiToken(agent) ||
      (await this.visitAuth.hasWriteRights(agent, visit));
    if (!hasRights) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { args, agent }
      );
    }

    return this.dataSource.updateVisit(args);
  }

  @Authorized()
  async deleteVisit(
    agent: UserWithRole | null,
    visitId: number
  ): Promise<Visit | Rejection> {
    const hasRights =
      this.userAuth.isApiToken(agent) ||
      (await this.visitAuth.hasWriteRights(agent, visitId));
    if (!hasRights) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { user: agent, visitId }
      );
    }

    return this.dataSource.deleteVisit(visitId);
  }
  @Authorized()
  async createVisitRegistration(
    agent: UserWithRole | null,
    visitId: number,
    userId: number
  ): Promise<VisitRegistration | Rejection> {
    if (!agent) {
      return rejection(
        'Can not create visit registration, because the request is not authorized'
      );
    }

    if (
      !this.userAuth.isApiToken(agent) &&
      !this.userAuth.isUserOfficer(agent) &&
      agent.id !== userId
    ) {
      return rejection(
        'Can not create visit registration, because the request is not authorized'
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
      userId,
      activeTemplate
    );

    return this.dataSource.updateRegistration({
      userId: userId,
      visitId: visitId,
      registrationQuestionaryId: questionary.questionaryId,
    });
  }

  @Authorized()
  async updateVisitRegistration(
    agent: UserWithRole | null,
    args: UpdateVisitRegistrationArgs
  ): Promise<VisitRegistration | Rejection> {
    const visitRegistration = await this.dataSource.getRegistration(
      args.userId,
      args.visitId
    );
    if (!visitRegistration) {
      return rejection(
        'Could not update Visit Registration because specified registration does not exist',
        { args }
      );
    }

    const hasWriteRights =
      this.userAuth.isApiToken(agent) ||
      (await this.registrationAuth.hasWriteRights(agent, args));
    if (!hasWriteRights) {
      return rejection(
        'Chould not update Visit Registration due to insufficient permissions',
        { args, user: agent }
      );
    }
    const TODAY_MIDNIGT = new Date(new Date().setHours(0, 0, 0, 0));

    if (args.startsAt && args.startsAt < TODAY_MIDNIGT) {
      return rejection(
        'Could not update Visit Registration because the start date is in the past',
        { args }
      );
    }

    const startsAt = args.startsAt ?? visitRegistration.startsAt;
    if (startsAt && args.endsAt && args.endsAt <= startsAt) {
      return rejection(
        'Could not update Visit Registration because the end date is before the start date',
        { args }
      );
    }

    return this.dataSource.updateRegistration(args);
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.VISIT_REGISTRATION_APPROVED)
  async approveVisitRegistration(
    user: UserWithRole | null,
    input: ApproveVisitRegistrationInput
  ) {
    const visitRegistration = await this.dataSource.getRegistration(
      input.userId,
      input.visitId
    );
    if (!visitRegistration) {
      return rejection(
        'Could not approve Visit Registration because specified registration does not exist',
        { visitRegistration: input }
      );
    }

    if (visitRegistration.status === VisitRegistrationStatus.DRAFTED) {
      return rejection(
        'Could not approve Visit Registration because registration is not submitted',
        { visitRegistration: input }
      );
    }

    return this.dataSource.updateRegistration({
      userId: input.userId,
      visitId: input.visitId,
      status: VisitRegistrationStatus.APPROVED,
    });
  }

  @Authorized()
  async submitVisitRegistration(
    agent: UserWithRole | null,
    args: SubmitVisitRegistrationArgs
  ) {
    const hasWriteRights =
      this.userAuth.isApiToken(agent) ||
      (await this.registrationAuth.hasWriteRights(agent, args));
    if (hasWriteRights === false) {
      return rejection(
        'Chould not submit Visit Registration due to insufficient permissions',
        { args, user: agent }
      );
    }

    return this.dataSource.updateRegistration({
      userId: args.userId,
      visitId: args.visitId,
      status: VisitRegistrationStatus.SUBMITTED,
    });
  }

  @Authorized()
  async cancelVisitRegistration(
    agent: UserWithRole | null,
    input: CancelVisitRegistrationInput
  ) {
    const hasCancelRights =
      this.userAuth.isApiToken(agent) ||
      (await this.registrationAuth.hasCancelRights(agent, input));
    if (!hasCancelRights) {
      return rejection(
        'Chould not cancel Visit Registration due to insufficient permissions',
        { args: input, user: agent }
      );
    }

    const registration = await this.dataSource.getRegistration(
      input.userId,
      input.visitId
    );

    if (!registration) {
      return rejection(
        'Could not cancel Visit Registration because specified registration does not exist',
        { input }
      );
    }

    const oldStatus = registration.status;
    const newStatus =
      input.userId === agent!.id
        ? VisitRegistrationStatus.CANCELLED_BY_USER
        : VisitRegistrationStatus.CANCELLED_BY_FACILITY;

    if (oldStatus === VisitRegistrationStatus.APPROVED) {
      // we are publishing cancellation message only if the registration was previously approved
      const eventBus = resolveApplicationEventBus();

      await eventBus.publish({
        type: Event.VISIT_REGISTRATION_CANCELLED,
        visitregistration: registration,
        key: 'visitregistration',
        loggedInUserId: agent ? agent.id : null,
        isRejection: false,
      });
    }

    return this.dataSource.updateRegistration({
      userId: input.userId,
      visitId: input.visitId,
      status: newStatus,
    });
  }
}
