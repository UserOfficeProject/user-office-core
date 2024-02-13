import { ReviewMeeting } from '../models/ReviewMeeting';
import { CreateReviewMeetingArgs } from '../resolvers/mutations/CreateReviewMeetingMutation';
import { UpdateReviewMeetingArgs } from '../resolvers/mutations/UpdateReviewMeetingMutation';
import { BasicUserDetails } from '../resolvers/types/BasicUserDetails';

export interface ReviewMeetingDataSource {
  // Read
  getReviewMeetings(): Promise<ReviewMeeting[]>;
  getReviewMeeting(reviewMeetindId: number): Promise<ReviewMeeting | null>;
  getParticipants(reviewMeetingId: number): Promise<BasicUserDetails[]>;
  // Write
  delete(reviewMeetingId: number): Promise<ReviewMeeting>;
  create(args: CreateReviewMeetingArgs): Promise<ReviewMeeting>;
  update(args: UpdateReviewMeetingArgs): Promise<ReviewMeeting>;
  assignParticipants(
    userIds: number[],
    reviewMeetingId: number
  ): Promise<boolean>;
  removeParticipant(userId: number, reviewMeetingId: number): Promise<boolean>;
}
