import { GraphQLError } from 'graphql';

import { ReviewMeeting } from '../../models/ReviewMeeting';
import { CreateReviewMeetingArgs } from '../../resolvers/mutations/CreateReviewMeetingMutation';
import { UpdateReviewMeetingArgs } from '../../resolvers/mutations/UpdateReviewMeetingMutation';
import { BasicUserDetails } from '../../resolvers/types/BasicUserDetails';
import { ReviewMeetingDataSource } from '../ReviewMeetingDataSource';
import database from './database';
import {
  createBasicUserObject,
  createReviewMeetingObject as createReviewMeetingObject,
  ReviewMeetingRecord as ReviewMeetingRecord,
  UserRecord,
} from './records';

class PostgresReviewMeetingDataSource implements ReviewMeetingDataSource {
  async getReviewMeetings(): Promise<ReviewMeeting[]> {
    return database('review_meetings')
      .select('*')
      .then((visits: ReviewMeetingRecord[]) =>
        visits.map((visit) => createReviewMeetingObject(visit))
      );
  }
  async getReviewMeeting(
    reviewMeetingId: number
  ): Promise<ReviewMeeting | null> {
    return database('review_meetings')
      .select('*')
      .where({ review_meeting_id: reviewMeetingId })
      .first()
      .then((visit) => (visit ? createReviewMeetingObject(visit) : null));
  }

  async getParticipants(reviewMeetingId: number): Promise<BasicUserDetails[]> {
    return database
      .select('*')
      .from('users as u')
      .join('review_meeting_has_users as temp', {
        'u.user_id': 'temp.user_id',
      })
      .join('institutions as i', { 'u.organisation': 'i.institution_id' })
      .where('temp.review_meeting_id', reviewMeetingId)
      .then((usersRecord: UserRecord[]) => {
        const users = usersRecord.map((user) => createBasicUserObject(user));

        return users;
      });
  }

  async create({
    name,
    details,
    creatorId,
    instrumentId,
    occursAt,
  }: CreateReviewMeetingArgs): Promise<ReviewMeeting> {
    return database('review_meetings')
      .insert({
        name: name,
        details: details,
        creator_id: creatorId,
        instrument_id: instrumentId,
        occurs_at: occursAt,
      })
      .returning('*')
      .then((visit) => createReviewMeetingObject(visit[0]))
      .catch((e) => {
        throw new GraphQLError(`Could not create review meeting: ${e}`);
      });
  }

  async update(args: UpdateReviewMeetingArgs): Promise<ReviewMeeting> {
    return database('review_meetings')
      .update({
        name: args.name,
        details: args.details,
        creator_id: args.creatorId,
        instrument_id: args.instrumentId,
        occurs_at: args.occursAt,
        notified: args.notified,
        updated_at: new Date(),
      })
      .where({ review_meeting_id: args.reviewMeetingId })
      .then(async () => {
        const updatedVisit = await this.getReviewMeeting(args.reviewMeetingId);

        if (!updatedVisit) {
          throw new GraphQLError('Updated review meeting not found');
        }

        return updatedVisit;
      });
  }

  async delete(reviewMeetingId: number): Promise<ReviewMeeting> {
    return database('review_meetings')
      .where({ review_meeting_id: reviewMeetingId })
      .delete()
      .returning('*')
      .then((result) => {
        if (result.length !== 1) {
          throw new GraphQLError('Review meeting not found');
        }

        return createReviewMeetingObject(result[0]);
      });
  }

  async assignParticipants(
    participantsIds: number[],
    reviewMeetingId: number
  ): Promise<boolean> {
    const dataToInsert = participantsIds.map((userId) => ({
      review_meeting_id: reviewMeetingId,
      user_id: userId,
    }));

    const result = await database('review_meeting_has_users').insert(
      dataToInsert
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async removeParticipant(
    participantId: number,
    reviewMeetingId: number
  ): Promise<boolean> {
    const result = await database('review_meeting_has_users')
      .where('review_meeting_id', reviewMeetingId)
      .andWhere('user_id', participantId)
      .del();

    if (result) {
      return true;
    } else {
      return false;
    }
  }
}

export default PostgresReviewMeetingDataSource;
