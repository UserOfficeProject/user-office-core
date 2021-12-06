import { container, inject, injectable } from 'tsyringe';

import { FeedbackAuthorization } from '../auth/FeedbackAuthorization';
import { Tokens } from '../config/Tokens';
import { FeedbackDataSource } from '../datasources/FeedbackDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Questionary } from '../models/Questionary';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { FeedbacksFilter } from '../resolvers/queries/FeedbacksQuery';
export interface GetRegistrationsFilter {
  questionaryIds?: number[];
  feedbackId?: number;
}

@injectable()
export default class FeedbackQueries {
  private feedbackAuth = container.resolve(FeedbackAuthorization);

  constructor(
    @inject(Tokens.FeedbackDataSource)
    public dataSource: FeedbackDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    public templateDataSource: TemplateDataSource
  ) {}

  @Authorized()
  async getFeedback(agent: UserWithRole | null, id: number) {
    const feedback = await this.dataSource.getFeedback(id);
    if (!feedback) {
      return null;
    }
    const hasRights = await this.feedbackAuth.hasReadRights(agent, feedback);
    if (hasRights === false) {
      return null;
    }

    return feedback;
  }

  @Authorized([Roles.USER_OFFICER])
  async getFeedbacks(agent: UserWithRole | null, filter?: FeedbacksFilter) {
    return this.dataSource.getFeedbacks(filter);
  }

  @Authorized()
  async getFeedbackByScheduledEventId(
    agent: UserWithRole | null,
    eventId: number
  ) {
    const feedback = await this.dataSource.getFeedbackByScheduledEventId(
      eventId
    );
    if (!feedback) {
      return null;
    }
    const hasRights = await this.feedbackAuth.hasReadRights(agent, feedback);
    if (hasRights === false) {
      return null;
    }

    return feedback;
  }

  async getQuestionary(questionaryId: number): Promise<Questionary> {
    const questionary = await this.questionaryDataSource.getQuestionary(
      questionaryId
    );
    if (!questionary) {
      throw new Error(
        'Unexpected error. Feedback must have a questionary, but not found'
      );
    }

    return questionary;
  }
}
