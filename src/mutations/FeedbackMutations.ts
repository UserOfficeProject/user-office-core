import { logger } from '@user-office-software/duo-logger';
import moment from 'moment';
import { container, inject, injectable } from 'tsyringe';

import { FeedbackAuthorization } from '../auth/FeedbackAuthorization';
import { Tokens } from '../config/Tokens';
import { FeedbackDataSource } from '../datasources/FeedbackDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { Feedback, FeedbackStatus } from '../models/Feedback';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { SettingsId } from '../models/Settings';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateFeedbackArgs } from '../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../resolvers/mutations/UpdateFeedbackMutation';
import { ProposalBookingStatusCore } from '../resolvers/types/ProposalBooking';
import { ScheduledEventCore } from '../resolvers/types/ScheduledEvent';
import { AdminDataSource } from './../datasources/AdminDataSource';
import { TemplateDataSource } from './../datasources/TemplateDataSource';
import { UserDataSource } from './../datasources/UserDataSource';
import { VisitDataSource } from './../datasources/VisitDataSource';
import { FeedbackRequest } from './../resolvers/types/FeedbackRequest';

@injectable()
export default class FeedbackMutations {
  private feedbackAuth = container.resolve(FeedbackAuthorization);

  constructor(
    @inject(Tokens.FeedbackDataSource)
    private dataSource: FeedbackDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.AdminDataSource)
    private adminDataSource: AdminDataSource,
    @inject(Tokens.MailService)
    private mailService: MailService
  ) {}

  @Authorized()
  async createFeedback(
    user: UserWithRole | null,
    args: CreateFeedbackArgs
  ): Promise<Feedback | Rejection> {
    const feedbackAlreadyExists =
      (
        await this.dataSource.getFeedbacks({
          scheduledEventId: args.scheduledEventId,
        })
      ).length > 0;

    if (feedbackAlreadyExists === true) {
      return rejection(
        'Can not create feedback because feedback for the visit that already exists',
        { args }
      );
    }

    const scheduledEvent =
      await this.scheduledEventDataSource.getScheduledEventCore(
        args.scheduledEventId
      );
    if (!scheduledEvent) {
      return rejection(
        'Can not create feedback because scheduled event does not exist',
        {
          args,
          agent: user,
        }
      );
    }

    if (scheduledEvent.status !== ProposalBookingStatusCore.COMPLETED) {
      return rejection(
        'Can not create feedback because scheduled event is not completed',
        {
          args,
          agent: user,
        }
      );
    }

    const visit = await this.visitDataSource.getVisitByScheduledEventId(
      scheduledEvent.id
    );

    if (visit === null) {
      return rejection('Can not create feedback because visit does not exist', {
        args,
        agent: user,
      });
    }

    const isTeamlead = visit.teamLeadUserId === user!.id;

    if (isTeamlead === false) {
      return rejection(
        'Can not create feedback because only teamlead can do that',
        { args, agent: user }
      );
    }

    try {
      const activeTemplateId =
        await this.templateDataSource.getActiveTemplateId(
          TemplateGroupId.FEEDBACK
        );
      if (activeTemplateId === null) {
        return rejection(
          'Can not create feedback because feedback template is not configured',
          { args, agent: user }
        );
      }
      const questionary = await this.questionaryDataSource.create(
        user!.id,
        activeTemplateId
      );
      const feedback = await this.dataSource.createFeedback({
        ...args,
        creatorId: user!.id,
        questionaryId: questionary.questionaryId,
      });

      return feedback;
    } catch (error) {
      return rejection(
        'Could not create feedback because of an error',
        { args },
        error
      );
    }
  }

  @Authorized()
  async updateFeedback(
    user: UserWithRole | null,
    args: UpdateFeedbackArgs
  ): Promise<Feedback | Rejection> {
    if (!user) {
      return rejection(
        'Could not update feedback because request is not authorized',
        { args }
      );
    }
    const feedback = await this.dataSource.getFeedback(args.feedbackId);

    if (!feedback) {
      return rejection(
        'Could not update feedback because specified feedback does not exist',
        { args }
      );
    }

    const hasRights = await this.feedbackAuth.hasWriteRights(user, feedback);

    if (hasRights === false) {
      return rejection(
        'Can not update feedback because of insufficient permissions',
        { args, agent: user }
      );
    }

    return this.dataSource.updateFeedback(args);
  }

  @Authorized()
  async deleteFeedback(
    user: UserWithRole | null,
    feedbackId: number
  ): Promise<Feedback | Rejection> {
    const hasRights = await this.feedbackAuth.hasWriteRights(user, feedbackId);
    if (hasRights === false) {
      return rejection(
        'Can not delete feedback because of insufficient permissions',
        { user, feedbackId }
      );
    }

    return this.dataSource.deleteFeedback(feedbackId);
  }

  getSettingOrDefault = async (settingId: SettingsId, defaultValue: number) => {
    const settingValue = await this.adminDataSource.getSetting(settingId);
    if (settingValue === null) {
      return defaultValue;
    }
    const settingValueAsNumber = parseInt(settingValue.settingsValue, 10);
    if (isNaN(settingValueAsNumber)) {
      return defaultValue;
    }

    return settingValueAsNumber;
  };

  /**
   * Checks if the scheduled event is too old to have feedback
   * @param scheduledEvent event
   * @returns true if event is too old
   */
  async isEventTooOld(scheduledEvent: ScheduledEventCore) {
    const FEEDBACK_EXHAUST_DAYS = await this.getSettingOrDefault(
      SettingsId.FEEDBACK_EXHAUST_DAYS,
      30
    );

    return moment(scheduledEvent.endsAt).isBefore(
      moment().subtract(FEEDBACK_EXHAUST_DAYS, 'days')
    );
  }

  async hasAlreadyRequested(scheduledEvent: ScheduledEventCore) {
    const FEEDBACK_MAX_REQUESTS = await this.getSettingOrDefault(
      SettingsId.FEEDBACK_MAX_REQUESTS,
      2
    );

    const feedbackRequests = await this.dataSource.getFeedbackRequests(
      scheduledEvent.id
    );

    if (feedbackRequests.length >= FEEDBACK_MAX_REQUESTS) {
      return true;
    }

    const FEEDBACK_FREQUENCY_DAYS = await this.getSettingOrDefault(
      SettingsId.FEEDBACK_FREQUENCY_DAYS,
      14
    );
    const mostRecentRequest = feedbackRequests.sort((a, b) => {
      return moment(a.requestedAt).isBefore(b.requestedAt) ? 1 : -1;
    })[0];

    return (
      mostRecentRequest &&
      moment(mostRecentRequest.requestedAt).isAfter(
        moment().subtract(FEEDBACK_FREQUENCY_DAYS, 'days')
      )
    );
  }

  /**
   * Checks if feedback is already provided
   * @param scheduledEvent event
   * @returns true if feedback is already provided
   */
  async hasProvidedFeedback(scheduledEvent: ScheduledEventCore) {
    const feedbacks = await this.dataSource.getFeedbacks({
      scheduledEventId: scheduledEvent.id,
    });

    if (feedbacks.length === 0) {
      return false;
    } else {
      return feedbacks[0].status === FeedbackStatus.SUBMITTED;
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async requestFeedback(
    user: UserWithRole | null,
    scheduledEventId: number
  ): Promise<FeedbackRequest | Rejection> {
    // Check if scheduled event exists
    const scheduledEvent =
      await this.scheduledEventDataSource.getScheduledEventCore(
        scheduledEventId
      );
    if (!scheduledEvent) {
      return rejection(
        'Can not create feedback because scheduled event does not exist',
        {
          args: { scheduledEventId },
        }
      );
    }

    // Check if visit exists
    const visit = await this.visitDataSource.getVisitByScheduledEventId(
      scheduledEvent.id
    );
    if (visit === null) {
      return rejection('Can not create feedback because visit does not exist', {
        args: { scheduledEventId },
      });
    }

    // Get teamlead user
    const teamLead = await this.userDataSource.getUser(visit.teamLeadUserId);
    if (!teamLead || !teamLead.email) {
      return rejection(
        'Can not create feedback because teamlead does not exist or it has no email',
        {
          args: { scheduledEventId, teamLead },
        }
      );
    }

    if (await this.hasProvidedFeedback(scheduledEvent)) {
      return rejection(
        'Will not ask for feedback because already been provided',
        {
          args: { scheduledEventId },
        }
      );
    }

    if (await this.isEventTooOld(scheduledEvent)) {
      return rejection('Will not ask for feedback because it is too old', {
        args: { scheduledEventId, teamLead },
      });
    }

    if (await this.hasAlreadyRequested(scheduledEvent)) {
      return rejection(
        'Will not ask for feedback because already recently requested',
        {
          args: { scheduledEventId, teamLead },
        }
      );
    }

    try {
      const { results } = await this.mailService.sendMail({
        content: {
          template_id: 'feedback-request',
        },
        substitution_data: {
          teamleadPreferredname: teamLead.preferredname,
          teamleadLastname: teamLead.lastname,
          feedbackurl: `${process.env.baseURL}/CreateFeedback/${scheduledEventId}`,
        },
        recipients: [{ address: teamLead.email }],
      });

      if (results.total_rejected_recipients === 0) {
        logger.logInfo('Feedback request email success', { results });

        return this.dataSource.createFeedbackRequest(scheduledEvent.id);
      } else {
        return rejection('Could not send feedback request email', { results });
      }
    } catch (error) {
      logger.logException('Feedback request email failure', error);

      return rejection(
        'Could not create feedback request because of an error',
        { args: { scheduledEventId } },
        error
      );
    }
  }
}
