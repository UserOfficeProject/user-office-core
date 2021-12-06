import { container, inject, injectable } from 'tsyringe';

import { FeedbackAuthorization } from '../auth/FeedbackAuthorization';
import { Tokens } from '../config/Tokens';
import { FeedbackDataSource } from '../datasources/FeedbackDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { Feedback } from '../models/Feedback';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateFeedbackArgs } from '../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../resolvers/mutations/UpdateFeedbackMutation';
import { ProposalBookingStatusCore } from '../resolvers/types/ProposalBooking';
import { TemplateDataSource } from './../datasources/TemplateDataSource';
import { VisitDataSource } from './../datasources/VisitDataSource';

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
    private scheduledEventDataSource: ScheduledEventDataSource
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
      await this.scheduledEventDataSource.getScheduledEvent(
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
}
