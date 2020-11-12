import 'reflect-metadata';
import { ProposalDataSourceMock } from '../datasources/mockups/ProposalDataSource';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummySampleReviewer,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Sample, SampleStatus } from '../models/Sample';
import SampleMutations from './SampleMutations';

const dummySampleDataSource = new SampleDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const dummyProposalDataSource = new ProposalDataSourceMock();

const sampleMutations = new SampleMutations(
  dummySampleDataSource,
  dummyQuestionaryDataSource,
  dummyTemplateDataSource,
  dummyProposalDataSource
);

beforeEach(() => {
  dummySampleDataSource.init();
  dummyQuestionaryDataSource.init();
  dummyTemplateDataSource.init();
  dummyProposalDataSource.init();
});

test('User should be able to clone its sample', () => {
  return expect(
    sampleMutations.cloneSample(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(Sample);
});

test('User officer should be able to clone sample', () => {
  return expect(
    sampleMutations.cloneSample(dummyUserOfficerWithRole, 1)
  ).resolves.toBeInstanceOf(Sample);
});

test('User should not be able to clone sample that does not exist', () => {
  return expect(
    sampleMutations.cloneSample(dummyUserOfficerWithRole, 100)
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
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
