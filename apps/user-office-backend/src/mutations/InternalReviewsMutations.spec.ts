import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyReview } from '../datasources/mockups/InternalReviewDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import InternalReviewMutations from './InternalReviewMutations';

const internalReviewMutations = container.resolve(InternalReviewMutations);

describe('Test Internal Reviews Mutations', () => {
  test('A user can not create an internal review', () => {
    return expect(
      internalReviewMutations.create(dummyUserWithRole, {
        title: 'Test title',
        comment: 'Test comment',
        files: '',
        reviewerId: 1,
        technicalReviewId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A not logged in user can not create an internal review', () => {
    return expect(
      internalReviewMutations.create(null, {
        title: 'Test title',
        comment: 'Test comment',
        files: '',
        reviewerId: 1,
        technicalReviewId: 1,
      })
    ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
  });

  test('A logged in user officer can create an internal review', async () => {
    const reviewToCreate = {
      title: 'Test title',
      comment: 'Test comment',
      files: '',
      reviewerId: 1,
      technicalReviewId: 1,
    };

    const createdReview = await internalReviewMutations.create(
      dummyUserOfficerWithRole,
      reviewToCreate
    );

    expect(createdReview).toHaveProperty('id');
    expect(createdReview.id).toBeDefined();
    expect(createdReview).toHaveProperty('createdAt');
    expect(createdReview).toHaveProperty(
      'assignedBy',
      dummyUserOfficerWithRole.id
    );
    expect(createdReview).toHaveProperty('title', reviewToCreate.title);
    expect(createdReview).toHaveProperty(
      'technicalReviewId',
      reviewToCreate.technicalReviewId
    );
  });

  test('A logged in user officer can update internal review', async () => {
    const reviewToUpdate = {
      id: 1,
      title: 'Test title updated',
      comment: 'Test comment updated',
      files: '',
      reviewerId: 1,
      technicalReviewId: 1,
    };

    const updatedReview = await internalReviewMutations.update(
      dummyUserOfficerWithRole,
      reviewToUpdate
    );

    expect(updatedReview).toHaveProperty('id', reviewToUpdate.id);
    expect(updatedReview).toHaveProperty('createdAt');
    expect(updatedReview).toHaveProperty(
      'assignedBy',
      dummyUserOfficerWithRole.id
    );
    expect(updatedReview).toHaveProperty('title', reviewToUpdate.title);
    expect(updatedReview).toHaveProperty(
      'technicalReviewId',
      reviewToUpdate.technicalReviewId
    );
  });

  test('A logged in user officer can delete internal review', async () => {
    const deletedReview = await internalReviewMutations.delete(
      dummyUserOfficerWithRole,
      {
        id: 1,
        technicalReviewId: 1,
      }
    );

    expect(deletedReview).toHaveProperty('id', dummyReview.id);
    expect(deletedReview).toHaveProperty('createdAt');
  });
});
