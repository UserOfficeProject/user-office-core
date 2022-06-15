import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyCall } from '../datasources/mockups/CallDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { AllocationTimeUnits } from '../models/Call';
import { CreateCallInput } from '../resolvers/mutations/CreateCallMutation';
import CallMutations from './CallMutations';

const callMutations = container.resolve(CallMutations);

describe('Test Call Mutations', () => {
  test('A user can not create a call', () => {
    return expect(
      callMutations.create(dummyUserWithRole, {
        shortCode: '2019-02-19',
        startCall: new Date('2019-02-19'),
        endCall: new Date('2019-02-19'),
        startReview: new Date('2019-02-19'),
        endReview: new Date('2019-02-19'),
        startSEPReview: new Date('2019-02-19'),
        endSEPReview: new Date('2019-02-19'),
        startNotify: new Date('2019-02-19'),
        endNotify: new Date('2019-02-19'),
        startCycle: new Date('2019-02-19'),
        endCycle: new Date('2019-02-19'),
        referenceNumberFormat: 'format',
        proposalSequence: 0,
        cycleComment: 'Comment review',
        surveyComment: 'Comment feedback',
        submissionMessage: 'Submission message',
        proposalWorkflowId: 1,
        allocationTimeUnit: AllocationTimeUnits.Day,
        templateId: 1,
        title: 'Title',
        description: 'Description',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user can not delete a call', () => {
    return expect(
      callMutations.delete(dummyUserWithRole, {
        callId: dummyCall.id,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A not logged in user can not create a call', () => {
    return expect(
      callMutations.create(null, {
        shortCode: '2019-02-19',
        startCall: new Date('2019-02-19'),
        endCall: new Date('2019-02-19'),
        startReview: new Date('2019-02-19'),
        endReview: new Date('2019-02-19'),
        startSEPReview: new Date('2019-02-19'),
        endSEPReview: new Date('2019-02-19'),
        startNotify: new Date('2019-02-19'),
        endNotify: new Date('2019-02-19'),
        startCycle: new Date('2019-02-19'),
        endCycle: new Date('2019-02-19'),
        referenceNumberFormat: 'format',
        proposalSequence: 0,
        cycleComment: 'Comment review',
        surveyComment: 'Comment feedback',
        submissionMessage: 'Submission message',
        proposalWorkflowId: 1,
        allocationTimeUnit: AllocationTimeUnits.Day,
        templateId: 1,
        title: 'Title',
        description: 'Description',
      })
    ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
  });

  test('A logged in user officer can not create a call with invalid dates', () => {
    const callToCreate = {
      shortCode: '2019-02-19',
      startCall: new Date('2019-02-19'),
      endCall: new Date('2019-02-18'),
      startReview: new Date('2019-02-19'),
      endReview: new Date('2019-02-18'),
      startSEPReview: new Date('2019-02-19'),
      endSEPReview: new Date('2019-02-19'),
      startNotify: new Date('2019-02-19'),
      endNotify: new Date('2019-02-19'),
      startCycle: new Date('2019-02-19'),
      endCycle: new Date('2019-02-19'),
      referenceNumberFormat: 'format',
      proposalSequence: 0,
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
      submissionMessage: 'Submission message',
      proposalWorkflowId: 1,
      allocationTimeUnit: AllocationTimeUnits.Day,
      templateId: 1,
      title: 'Title',
      description: 'Description',
    };

    return expect(
      callMutations.create(dummyUserOfficerWithRole, callToCreate)
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A logged in user officer can create a call', () => {
    const callToCreate: CreateCallInput = {
      shortCode: '2019-02-19',
      startCall: new Date('2019-02-19'),
      endCall: new Date('2019-02-19'),
      startReview: new Date('2019-02-19'),
      endReview: new Date('2019-02-19'),
      startSEPReview: new Date('2019-02-19'),
      endSEPReview: new Date('2019-02-19'),
      startNotify: new Date('2019-02-19'),
      endNotify: new Date('2019-02-19'),
      startCycle: new Date('2019-02-19'),
      endCycle: new Date('2019-02-19'),
      referenceNumberFormat: 'format',
      proposalSequence: 0,
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
      submissionMessage: 'Submission message',
      proposalWorkflowId: 1,
      allocationTimeUnit: AllocationTimeUnits.Day,
      templateId: 1,
      esiTemplateId: 2,
      title: 'Title',
      description: 'Description',
    };

    return expect(
      callMutations.create(dummyUserOfficerWithRole, callToCreate)
    ).resolves.toStrictEqual({
      id: 1,
      ...callToCreate,
      callEnded: false,
      callReviewEnded: false,
      callSEPReviewEnded: false,
      templateId: 1,
    });
  });

  test('A logged in user can not update a call', () => {
    return expect(
      callMutations.update(dummyUserWithRole, {
        id: 1,
        shortCode: '2020-06-18',
        startCall: new Date('2020-06-18'),
        endCall: new Date('2020-06-18'),
        startReview: new Date('2020-06-18'),
        endReview: new Date('2020-06-18'),
        startSEPReview: new Date('2019-02-19'),
        endSEPReview: new Date('2019-02-19'),
        startNotify: new Date('2020-06-18'),
        endNotify: new Date('2020-06-18'),
        startCycle: new Date('2020-06-18'),
        endCycle: new Date('2020-06-18'),
        referenceNumberFormat: 'format',
        proposalSequence: 0,
        cycleComment: 'Comment review update',
        surveyComment: 'Comment feedback update',
        submissionMessage: 'Submission message update',
        proposalWorkflowId: 1,
        allocationTimeUnit: AllocationTimeUnits.Day,
        templateId: 1,
        title: 'Title',
        description: 'Description',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can update a call', () => {
    const updatedCall = {
      id: 1,
      shortCode: '2020-06-18',
      startCall: new Date('2020-06-18'),
      endCall: new Date('2020-06-18'),
      startReview: new Date('2020-06-18'),
      endReview: new Date('2020-06-18'),
      startSEPReview: new Date('2019-02-19'),
      endSEPReview: new Date('2019-02-19'),
      startNotify: new Date('2020-06-18'),
      endNotify: new Date('2020-06-18'),
      startCycle: new Date('2020-06-18'),
      endCycle: new Date('2020-06-18'),
      referenceNumberFormat: 'format',
      proposalSequence: 0,
      cycleComment: 'Comment review update',
      surveyComment: 'Comment feedback update',
      submissionMessage: 'Submission message update',
      proposalWorkflowId: 1,
      allocationTimeUnit: AllocationTimeUnits.Day,
      templateId: 1,
      title: 'Title',
      description: 'Description',
    };

    return expect(
      callMutations.update(dummyUserOfficerWithRole, updatedCall)
    ).resolves.toStrictEqual({ ...dummyCall, ...updatedCall });
  });

  test('A logged in user can not assign instrument to a call', () => {
    return expect(
      callMutations.assignInstrumentsToCall(dummyUserWithRole, {
        callId: 1,
        instrumentIds: [1],
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can assign instrument to a call', () => {
    return expect(
      callMutations.assignInstrumentsToCall(dummyUserOfficerWithRole, {
        callId: 1,
        instrumentIds: [1],
      })
    ).resolves.toBe(dummyCall);
  });

  test('A logged in user can not remove assigned instrument from a call', () => {
    return expect(
      callMutations.removeAssignedInstrumentFromCall(dummyUserWithRole, {
        callId: 1,
        instrumentId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can remove assigned instrument from a call', () => {
    return expect(
      callMutations.removeAssignedInstrumentFromCall(dummyUserOfficerWithRole, {
        callId: 1,
        instrumentId: 1,
      })
    ).resolves.toBe(dummyCall);
  });
});
