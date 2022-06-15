import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import {
  dummySampleReviewer,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { isRejection, Rejection } from '../models/Rejection';
import { Sample, SampleStatus } from '../models/Sample';
import SampleMutations from './SampleMutations';

const sampleMutations = container.resolve(SampleMutations);

beforeEach(() => {
  container.resolve<SampleDataSourceMock>(Tokens.SampleDataSource).init();
});

test('User should be able to clone its sample', () => {
  return expect(
    sampleMutations.cloneSample(dummyUserWithRole, { sampleId: 1 })
  ).resolves.toBeInstanceOf(Sample);
});

test('User officer should be able to clone sample', () => {
  return expect(
    sampleMutations.cloneSample(dummyUserOfficerWithRole, { sampleId: 1 })
  ).resolves.toBeInstanceOf(Sample);
});

test('User should not be able to clone sample that does not exist', () => {
  return expect(
    sampleMutations.cloneSample(dummyUserOfficerWithRole, { sampleId: 100 })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User should be able to update title of the sample', () => {
  const newTitle = 'Updated title';

  return expect(
    sampleMutations.updateSample(dummyUserWithRole, {
      sampleId: 1,
      title: newTitle,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('User should not be able to update the sample safety status', async () => {
  return expect(
    sampleMutations.updateSample(dummyUserWithRole, {
      sampleId: 1,
      safetyStatus: SampleStatus.HIGH_RISK,
    })
  ).resolves.not.toHaveProperty('safetyStatus', SampleStatus.HIGH_RISK);
});

test('User should not be able to update the sample safety comment', () => {
  const newComment = 'Updated comment';

  return expect(
    sampleMutations.updateSample(dummyUserWithRole, {
      sampleId: 1,
      safetyComment: newComment,
    })
  ).resolves.not.toHaveProperty('safetyComment', newComment);
});

test('Sample safety reviewer should be able to update the sample safety status', async () => {
  return expect(
    sampleMutations.updateSample(dummySampleReviewer, {
      sampleId: 1,
      safetyStatus: SampleStatus.HIGH_RISK,
    })
  ).resolves.toHaveProperty('safetyStatus', SampleStatus.HIGH_RISK);
});

test('Sample safety reviewer should be able to update the sample safety comment', async () => {
  const newComment = 'Updated comment';

  return expect(
    sampleMutations.updateSample(dummySampleReviewer, {
      sampleId: 1,
      safetyComment: newComment,
    })
  ).resolves.toHaveProperty('safetyComment', newComment);
});

test('User can delete sample', async () => {
  const result = await sampleMutations.deleteSample(dummyUserWithRole, 1);
  expect(isRejection(result)).toBeFalsy();
});

test('User not on proposal can not delete sample', async () => {
  const result = await sampleMutations.deleteSample(
    dummyUserNotOnProposalWithRole,
    1
  );
  expect(isRejection(result)).toBeTruthy();
});

test('User can update sample', async () => {
  const updatedTitle = 'Updated title';
  const result = await sampleMutations.updateSample(dummyUserWithRole, {
    sampleId: 1,
    title: updatedTitle,
  });
  expect((result as Sample).title).toEqual(updatedTitle);
});

test('User not on proposal can not update sample', async () => {
  const result = await sampleMutations.updateSample(
    dummyUserNotOnProposalWithRole,
    { sampleId: 1, title: 'Not my sample' }
  );
  expect(isRejection(result)).toBeTruthy();
});
