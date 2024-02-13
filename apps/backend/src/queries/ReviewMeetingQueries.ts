import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewMeetingDataSource } from '../datasources/ReviewMeetingDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
export interface GetRegistrationsFilter {
  questionaryIds?: number[];
  visitId?: number;
}

@injectable()
export default class ReviewMeetingQueries {
  constructor(
    @inject(Tokens.ReviewMeetingDataSource)
    public dataSource: ReviewMeetingDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getReviewMeetings(_agent: UserWithRole | null) {
    return this.dataSource.getReviewMeetings();
  }

  @Authorized([Roles.USER_OFFICER])
  async getReviewMeeting(_agent: UserWithRole | null, reviewMeetingId: number) {
    return this.dataSource.getReviewMeeting(reviewMeetingId);
  }
}
