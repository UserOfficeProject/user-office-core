import { GraphQLError } from 'graphql';

import { InternalReview } from '../../models/InternalReview';
import { UserWithRole } from '../../models/User';
import { CreateInternalReviewInput } from '../../resolvers/mutations/internalReview/CreateInternalReviewMutation';
import { DeleteInternalReviewInput } from '../../resolvers/mutations/internalReview/DeleteInternalReviewMutation';
import { UpdateInternalReviewInput } from '../../resolvers/mutations/internalReview/UpdateInternalReviewMutation';
import { InternalReviewsFilter } from '../../resolvers/queries/InternalReviewsQuery';
import { InternalReviewDataSource } from '../InternalReviewDataSource';

export const dummyReview = new InternalReview(
  1,
  'Safety_review',
  'This is just a test for internal review',
  '',
  1,
  1,
  1,
  new Date('2023-06-21')
);
export const anotherDummyReview = new InternalReview(
  2,
  'Safety_review',
  'This is just a test for internal review',
  '',
  1,
  1,
  1,
  new Date('2023-06-21')
);
export const thirdDummyReview = new InternalReview(
  3,
  'Safety_review',
  'This is just a test for internal review',
  '',
  2,
  1,
  1,
  new Date('2023-06-21')
);
export const dummyReviews = [dummyReview, anotherDummyReview, thirdDummyReview];

export class InternalReviewDataSourceMock implements InternalReviewDataSource {
  async getInternalReview(id: number): Promise<InternalReview | null> {
    return dummyReviews.find((review) => review.id === id) || null;
  }

  async getInternalReviews(
    filter?: InternalReviewsFilter
  ): Promise<InternalReview[]> {
    return dummyReviews.filter(
      (review) => review.technicalReviewId === filter?.technicalReviewId
    );
  }

  async create(
    agent: UserWithRole,
    input: CreateInternalReviewInput
  ): Promise<InternalReview> {
    const randomId = Math.floor(Math.random() * 100 + 1);
    const newInternalReview = new InternalReview(
      randomId,
      input.title,
      input.comment,
      input.files,
      input.reviewerId,
      input.technicalReviewId,
      agent.id,
      new Date()
    );

    dummyReviews.push(newInternalReview);

    return newInternalReview;
  }

  async update(
    agent: UserWithRole,
    input: UpdateInternalReviewInput
  ): Promise<InternalReview> {
    const foundIndex = dummyReviews.findIndex((item) => item.id === input.id);
    if (foundIndex === -1) {
      throw new GraphQLError('Internal review not found');
    }

    dummyReviews.forEach((item, index) => {
      if (item.id === input.id) {
        const updatedInternalReview = new InternalReview(
          input.id,
          input.title,
          input.comment,
          input.files,
          input.reviewerId,
          input.technicalReviewId,
          agent.id,
          new Date()
        );

        dummyReviews[index] = updatedInternalReview;

        return;
      }
    });

    return dummyReviews[foundIndex];
  }

  async delete(input: DeleteInternalReviewInput): Promise<InternalReview> {
    const foundIndex = dummyReviews.findIndex((item) => item.id === input.id);
    if (foundIndex === -1) {
      throw new GraphQLError('Internal review not found');
    }
    const removedElement = { ...dummyReviews[foundIndex] };

    dummyReviews.splice(foundIndex, 1);

    return removedElement;
  }

  async isInternalReviewerOnTechnicalReview(
    userId: number,
    technicalReviewId: number
  ) {
    if (
      dummyReviews.find(
        (review) =>
          review.technicalReviewId === technicalReviewId &&
          review.reviewerId === userId
      )
    ) {
      return true;
    } else {
      return false;
    }
  }
  async isInternalReviewer(userId: number) {
    return true;
  }

  async getAllReviewersOnInternalReview(id: number) {
    return [1, 2];
  }
}
