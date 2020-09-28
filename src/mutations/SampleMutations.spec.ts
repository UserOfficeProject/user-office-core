import 'reflect-metadata';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { Sample } from '../models/Sample';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import SampleMutations from './SampleMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock(),
  new SEPDataSourceMock()
);

const dummySampleDataSource = new SampleDataSourceMock();
const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const sampleMutations = new SampleMutations(
  dummySampleDataSource,
  dummyQuestionaryDataSource,
  dummyTemplateDataSource,
  logger
);

beforeEach(() => {
  dummySampleDataSource.init();
  dummyQuestionaryDataSource.init();
  dummyTemplateDataSource.init();
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
