import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ReviewMeetingDataSource } from '../datasources/ReviewMeetingDataSource';
import { Authorized, EventBus } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { Event } from '../events/event.enum';
import { Rejection, rejection } from '../models/Rejection';
import { ReviewMeeting } from '../models/ReviewMeeting';
import { UserWithRole } from '../models/User';
import {
  AssignUsersToReviewMeetingArgs,
  RemoveUserFromReviewMeetingArgs,
} from '../resolvers/mutations/AssignUsersToReviewMeetingMutation';
import { CreateReviewMeetingArgs } from '../resolvers/mutations/CreateReviewMeetingMutation';
import { UpdateReviewMeetingArgs } from '../resolvers/mutations/UpdateReviewMeetingMutation';

@injectable()
export default class ReviewMeetingMutations {
  constructor(
    @inject(Tokens.ReviewMeetingDataSource)
    private dataSource: ReviewMeetingDataSource,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized()
  async create(
    user: UserWithRole | null,
    args: CreateReviewMeetingArgs
  ): Promise<ReviewMeeting | Rejection> {
    const instrument = await this.instrumentDataSource.getInstrument(
      args.instrumentId
    );

    if (!instrument) {
      return rejection(
        'Can not create review meeting because instrument does not exist',
        {
          args,
          agent: user,
        }
      );
    }

    try {
      const visit = await this.dataSource.create(args);

      return visit;
    } catch (error) {
      return rejection(
        'Could not create review meeting because of an error',
        { args, agent: user },
        error
      );
    }
  }

  @Authorized()
  async update(
    user: UserWithRole | null,
    args: UpdateReviewMeetingArgs
  ): Promise<ReviewMeeting | Rejection> {
    const reviewMeeting = await this.dataSource.getReviewMeeting(
      args.reviewMeetingId
    );

    if (!reviewMeeting) {
      return rejection(
        'Could not update review meeting because ID does not exist',
        { args, agent: user }
      );
    }

    if (args.instrumentId) {
      const instrument = await this.instrumentDataSource.getInstrument(
        args.instrumentId
      );

      if (!instrument) {
        return rejection(
          'Can not update review meeting because instrument does not exist',
          {
            args,
            agent: user,
          }
        );
      }
    }

    return this.dataSource.update(args).catch((error) => {
      return rejection(
        'Could not update review meeting',
        { agent: user, args },
        error
      );
    });
  }

  @Authorized()
  async delete(
    user: UserWithRole | null,
    reviewMeetingId: number
  ): Promise<ReviewMeeting | Rejection> {
    return this.dataSource.delete(reviewMeetingId).catch((error) => {
      return rejection(
        'Could not delete review meeting',
        { agent: user, reviewMeetingId },
        error
      );
    });
  }

  @Authorized()
  async assignParticipants(
    agent: UserWithRole | null,
    args: AssignUsersToReviewMeetingArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignParticipants(args.usersIds, args.reviewMeetingId)
      .catch((error) => {
        return rejection(
          'Could not assign user/s to review meeting',
          { agent, args },
          error
        );
      });
  }

  @Authorized()
  async removeParticipant(
    agent: UserWithRole | null,
    args: RemoveUserFromReviewMeetingArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeParticipant(args.userId, args.reviewMeetingId)
      .catch((error) => {
        return rejection(
          'Could not remove assigned user from review meeting',
          { agent, args },
          error
        );
      });
  }

  @Authorized()
  @EventBus(Event.REVIEW_MEETING_NOTIFIED)
  async notifyParticipants(
    user: UserWithRole | null,
    {
      reviewMeetingId,
      templateId,
    }: {
      reviewMeetingId: number;
      templateId: string;
    }
  ): Promise<ReviewMeeting | Rejection> {
    const reviewMeeting = await this.dataSource.getReviewMeeting(
      reviewMeetingId
    );

    if (!reviewMeeting) {
      return rejection('Can not notify review meeting because ID not found', {
        reviewMeetingId,
      });
    }

    this.dataSource.update({
      reviewMeetingId,
      notified: true,
    });

    const emailTemplates = (await this.emailService.getEmailTemplates())
      .results;

    const emailTemplate = emailTemplates.find(
      (template) => template.id === templateId
    );

    if (!emailTemplate) {
      return rejection(
        'Can not notify review meeting because email template not found',
        { templateId }
      );
    }

    return (
      reviewMeeting ||
      rejection('Can not notify review meeting', {
        agent: user,
        reviewMeetingId,
        templateId,
      })
    );
  }
}
