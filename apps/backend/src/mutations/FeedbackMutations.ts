import { logger } from '@user-office-software/duo-logger';
import moment from 'moment';
import { container, inject, injectable } from 'tsyringe';

import { FeedbackAuthorization } from '../auth/FeedbackAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { FeedbackDataSource } from '../datasources/FeedbackDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ExperimentStatus } from '../models/Experiment';
import { Feedback, FeedbackStatus } from '../models/Feedback';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { SettingsId } from '../models/Settings';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateFeedbackArgs } from '../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../resolvers/mutations/UpdateFeedbackMutation';
import { Experiment } from '../resolvers/types/Experiment';
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
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.AdminDataSource)
    private adminDataSource: AdminDataSource,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource,
    @inject(Tokens.MailService)
    private mailService: MailService,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async createFeedback(
    agent: UserWithRole | null,
    args: CreateFeedbackArgs
  ): Promise<Feedback | Rejection> {
    const feedbackAlreadyExists =
      (
        await this.dataSource.getFeedbacks({
          experimentPk: args.experimentPk,
        })
      ).length > 0;

    if (feedbackAlreadyExists === true) {
      return rejection(
        'Can not create feedback because feedback for the visit that already exists',
        { args }
      );
    }

    const experiment = await this.experimentDataSource.getExperiment(
      args.experimentPk
    );
    if (!experiment) {
      return rejection(
        'Can not create feedback because experiment does not exist',
        {
          args,
          agent: agent,
        }
      );
    }

    if (experiment.status !== ExperimentStatus.COMPLETED) {
      return rejection(
        'Can not create feedback because experiment is not completed',
        {
          args,
          agent: agent,
        }
      );
    }

    const visit = await this.visitDataSource.getVisitByExperimentPk(
      experiment.experimentPk
    );

    if (visit === null) {
      return rejection('Can not create feedback because visit does not exist', {
        args,
        agent: agent,
      });
    }

    const isTeamlead = visit.teamLeadUserId === agent!.id;

    if (isTeamlead === false) {
      return rejection(
        'Can not create feedback because only teamlead can do that',
        { args, agent: agent }
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
          { args, agent: agent }
        );
      }
      const questionary = await this.questionaryDataSource.create(
        agent!.id,
        activeTemplateId
      );
      const feedback = await this.dataSource.createFeedback({
        ...args,
        creatorId: agent!.id,
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
    agent: UserWithRole | null,
    args: UpdateFeedbackArgs
  ): Promise<Feedback | Rejection> {
    if (!agent) {
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

    const hasRights =
      this.userAuth.isApiToken(agent) ||
      (await this.feedbackAuth.hasWriteRights(agent, feedback));

    if (hasRights === false) {
      return rejection(
        'Can not update feedback because of insufficient permissions',
        { args, agent: agent }
      );
    }

    return this.dataSource.updateFeedback(args);
  }

  @Authorized()
  async deleteFeedback(
    agent: UserWithRole | null,
    feedbackId: number
  ): Promise<Feedback | Rejection> {
    const hasRights =
      this.userAuth.isApiToken(agent) ||
      (await this.feedbackAuth.hasWriteRights(agent, feedbackId));
    if (hasRights === false) {
      return rejection(
        'Can not delete feedback because of insufficient permissions',
        { user: agent, feedbackId }
      );
    }

    return this.dataSource.deleteFeedback(feedbackId);
  }

  /**
   * Checks if the experiment is too old to have feedback
   * @param experiment Experiment
   * @returns true if event is too old
   */
  async isEventTooOld(experiment: Experiment) {
    const FEEDBACK_EXHAUST_DAYS =
      await this.adminDataSource.getSettingOrDefault(
        SettingsId.FEEDBACK_EXHAUST_DAYS,
        30
      );

    return moment(experiment.endsAt).isBefore(
      moment().subtract(FEEDBACK_EXHAUST_DAYS, 'days')
    );
  }

  async hasAlreadyRequested(experiment: Experiment) {
    const FEEDBACK_MAX_REQUESTS =
      await this.adminDataSource.getSettingOrDefault(
        SettingsId.FEEDBACK_MAX_REQUESTS,
        2
      );

    const feedbackRequests = await this.dataSource.getFeedbackRequests(
      experiment.experimentPk
    );

    if (feedbackRequests.length >= FEEDBACK_MAX_REQUESTS) {
      return true;
    }

    const FEEDBACK_FREQUENCY_DAYS =
      await this.adminDataSource.getSettingOrDefault(
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
   * @param experiment Experiment
   * @returns true if feedback is already provided
   */
  async hasProvidedFeedback(experiment: Experiment) {
    const feedbacks = await this.dataSource.getFeedbacks({
      experimentPk: experiment.experimentPk,
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
    experimentPk: number
  ): Promise<FeedbackRequest | Rejection> {
    // Check if experiment exists
    const experiment =
      await this.experimentDataSource.getExperiment(experimentPk);
    if (!experiment) {
      return rejection(
        'Can not create feedback because experiment does not exist',
        {
          args: { experimentPk },
        }
      );
    }

    // Check if visit exists
    const visit = await this.visitDataSource.getVisitByExperimentPk(
      experiment.experimentPk
    );
    if (visit === null) {
      return rejection('Can not create feedback because visit does not exist', {
        args: { experimentPk },
      });
    }

    // Get teamlead user
    const teamLead = await this.userDataSource.getUser(visit.teamLeadUserId);
    if (!teamLead || !teamLead.email) {
      return rejection(
        'Can not create feedback because teamlead does not exist or it has no email',
        {
          args: { experimentPk, teamLead },
        }
      );
    }

    if (await this.hasProvidedFeedback(experiment)) {
      return rejection(
        'Will not ask for feedback because already been provided',
        {
          args: { experimentPk },
        }
      );
    }

    if (await this.isEventTooOld(experiment)) {
      return rejection('Will not ask for feedback because it is too old', {
        args: { experimentPk, teamLead },
      });
    }

    if (await this.hasAlreadyRequested(experiment)) {
      return rejection(
        'Will not ask for feedback because already recently requested',
        {
          args: { experimentPk, teamLead },
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
          feedbackurl: `${process.env.baseURL}/CreateFeedback/${experimentPk}`,
        },
        recipients: [{ address: teamLead.email }],
      });

      if (results.total_rejected_recipients === 0) {
        logger.logInfo('Feedback request email success', { results });

        return this.dataSource.createFeedbackRequest(experiment.experimentPk);
      } else {
        return rejection('Could not send feedback request email', { results });
      }
    } catch (error) {
      logger.logException('Feedback request email failure', error);

      return rejection(
        'Could not create feedback request because of an error',
        { args: { experimentPk } },
        error
      );
    }
  }
}
