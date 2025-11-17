import 'reflect-metadata';
import { container } from 'tsyringe';

import ExperimentSafetyPdfTemplateQueries from './ExperimentSafetyPdfTemplateQueries';
import { Tokens } from '../config/Tokens';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ExperimentSafetyPdfTemplate } from '../models/ExperimentSafetyPdfTemplate';

const experimentSafetyPdfTemplateQueries = container.resolve(
  ExperimentSafetyPdfTemplateQueries
);
beforeEach(() => {
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
});

test('A userofficer can get a Experiment Safety PDF template', () => {
  return expect(
    experimentSafetyPdfTemplateQueries.getExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      1
    )
  ).resolves.toBeInstanceOf(ExperimentSafetyPdfTemplate);
});

test('A user can get a Experiment Safety  template', () => {
  return expect(
    experimentSafetyPdfTemplateQueries.getExperimentSafetyPdfTemplate(
      dummyUserWithRole,
      1
    )
  ).resolves.toBeInstanceOf(ExperimentSafetyPdfTemplate);
});

test('A userofficer can get multiple Experiment Safety  templates', async () => {
  const pdfTemplates =
    await experimentSafetyPdfTemplateQueries.getExperimentSafetyPdfTemplates(
      dummyUserOfficerWithRole,
      {
        filter: {
          experimentSafetyPdfTemplateIds: [1],
        },
      }
    );

  expect(pdfTemplates.length).toBeGreaterThan(0);
});

test('A user can get multiple Experiment Safety  templates', async () => {
  const pdfTemplates =
    await experimentSafetyPdfTemplateQueries.getExperimentSafetyPdfTemplates(
      dummyUserWithRole,
      {
        filter: {
          experimentSafetyPdfTemplateIds: [1],
        },
      }
    );

  expect(pdfTemplates.length).toBeGreaterThan(0);
});
