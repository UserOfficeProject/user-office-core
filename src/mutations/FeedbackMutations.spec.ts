import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { FeedbackRequest } from '../models/FeedbackRequest';
import { Rejection } from '../models/Rejection';
import { FeedbackDataSourceMock } from './../datasources/mockups/FeedbackDataSource';
import FeedbackMutations from './FeedbackMutations';

const mutations = container.resolve(FeedbackMutations);

describe('Test Admin Mutations', () => {
  beforeEach(() => {
    container.resolve<FeedbackDataSourceMock>(Tokens.FeedbackDataSource).init();
    container.resolve<VisitDataSourceMock>(Tokens.VisitDataSource).init();
    container.resolve<AdminDataSourceMock>(Tokens.AdminDataSource).init();
  });

  test('Should not ask for feedback for unfinished experiments', async () => {
    const request = mutations.requestFeedback(dummyUserOfficerWithRole, 1);

    return expect(request).resolves.toBeInstanceOf(Rejection);
  });

  test('Should ask for feedback', async () => {
    const request = mutations.requestFeedback(dummyUserOfficerWithRole, 4);

    await expect(request).resolves.toBeInstanceOf(FeedbackRequest);
  });

  test('Should ask for feedback if feedback is in draft state', () => {
    const request = mutations.requestFeedback(dummyUserOfficerWithRole, 4);

    return expect(request).resolves.toBeInstanceOf(FeedbackRequest);
  });

  test('Should not ask for feedback twice', async () => {
    await mutations.requestFeedback(dummyUserOfficerWithRole, 4);

    const request = mutations.requestFeedback(dummyUserOfficerWithRole, 4);

    return expect(request).resolves.toBeInstanceOf(Rejection);
  });

  test('Should not request for feedback if feedback already provided', () => {
    const request = mutations.requestFeedback(dummyUserOfficerWithRole, 3);

    return expect(request).resolves.toBeInstanceOf(Rejection);
  });
});
