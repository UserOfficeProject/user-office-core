import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ExperimentSafetyPdfTemplateDataSourceMock } from '../datasources/mockups/ExperimentSafetyPdfTemplateDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ExperimentSafetyPdfTemplate } from '../models/ExperimentSafetyPdfTemplate';
import { isRejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { Template } from '../models/Template';
import ExperimentSafetyPdfTemplateMutations from './ExperimentSafetyPdfTemplateMutations';

const experimentSafetyPdfTemplateMutations = container.resolve(
  ExperimentSafetyPdfTemplateMutations
);

const mockGetTemplate = jest.spyOn(
  TemplateDataSourceMock.prototype,
  'getTemplate'
);

const mockCreateExperimentSafetyPdfTemplate = jest.spyOn(
  ExperimentSafetyPdfTemplateDataSourceMock.prototype,
  'createPdfTemplate'
);

const mockUpdateExperimentSafetyPdfTemplate = jest.spyOn(
  ExperimentSafetyPdfTemplateDataSourceMock.prototype,
  'updatePdfTemplate'
);

const mockDeleteExperimentSafetyPdfTemplate = jest.spyOn(
  ExperimentSafetyPdfTemplateDataSourceMock.prototype,
  'delete'
);

beforeEach(() => {
  container
    .resolve<ExperimentSafetyPdfTemplateDataSourceMock>(
      Tokens.ExperimentSafetyPdfTemplateDataSource
    )
    .init();
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();

  mockGetTemplate.mockClear();
  mockCreateExperimentSafetyPdfTemplate.mockClear();
  mockDeleteExperimentSafetyPdfTemplate.mockClear();
});

test('A userofficer can create a ExperimentSafety PDF template', async () => {
  const templateId = 1;
  const templateData = '...';
  const templateHeader = '...';
  const templateFooter = '...';
  const templateSampleDeclaration = '...';
  const dummyData = '...';

  mockGetTemplate.mockImplementation((templateId: number) =>
    Promise.resolve(
      new Template(templateId, TemplateGroupId.PROPOSAL_PDF, '', '', false)
    )
  );

  let template =
    await experimentSafetyPdfTemplateMutations.createExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      {
        templateId,
        templateData,
        templateHeader,
        templateFooter,
        templateSampleDeclaration,
        dummyData,
      }
    );

  expect(template instanceof ExperimentSafetyPdfTemplate).toBe(true);
  template = template as ExperimentSafetyPdfTemplate;
  expect(template.templateId).toEqual(templateId);
  expect(template.templateData).toEqual(templateData);
  expect(template.creatorId).toEqual(dummyUserOfficerWithRole.id);
  expect(template.created).toBeInstanceOf(Date);
});

test('A user cannot create a PDF template', async () => {
  const templateId = 1;
  const templateData = '...';
  const templateHeader = '...';
  const templateFooter = '...';
  const templateSampleDeclaration = '...';
  const dummyData = '...';

  mockGetTemplate.mockImplementation((templateId: number) =>
    Promise.resolve(
      new Template(templateId, TemplateGroupId.PROPOSAL_PDF, '', '', false)
    )
  );

  const template =
    await experimentSafetyPdfTemplateMutations.createExperimentSafetyPdfTemplate(
      dummyUserWithRole,
      {
        templateId,
        templateData,
        templateHeader,
        templateFooter,
        templateSampleDeclaration,
        dummyData,
      }
    );

  expect(template instanceof ExperimentSafetyPdfTemplate).toBe(false);
});

test('Template must be correct type for PDF template to be created', async () => {
  const templateId = 1;
  const templateData = '...';
  const templateHeader = '...';
  const templateFooter = '...';
  const templateSampleDeclaration = '...';
  const dummyData = '...';

  mockGetTemplate.mockImplementation((templateId: number) =>
    Promise.resolve(
      new Template(templateId, TemplateGroupId.GENERIC_TEMPLATE, '', '', false)
    )
  );

  const template =
    await experimentSafetyPdfTemplateMutations.createExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      {
        templateId,
        templateData,
        templateHeader,
        templateFooter,
        templateSampleDeclaration,
        dummyData,
      }
    );

  expect(isRejection(template)).toBeTruthy();
});

test('Create PDF template database error gives friendly error', async () => {
  const templateId = 1;
  const templateData = '...';
  const templateHeader = '...';
  const templateFooter = '...';
  const templateSampleDeclaration = '...';
  const dummyData = '...';

  mockGetTemplate.mockImplementation((templateId: number) =>
    Promise.resolve(
      new Template(templateId, TemplateGroupId.PROPOSAL_PDF, '', '', false)
    )
  );

  mockCreateExperimentSafetyPdfTemplate.mockRejectedValue(
    new Error('Database error')
  );

  const template =
    await experimentSafetyPdfTemplateMutations.createExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      {
        templateId,
        templateData,
        templateHeader,
        templateFooter,
        templateSampleDeclaration,
        dummyData,
      }
    );

  expect(isRejection(template)).toBeTruthy();
});

test('A userofficer can update a PDF template', async () => {
  const existingPdfTemplateId = 1;
  const newTemplateData = 'new data';
  const newTemplateHeader = 'new header';
  const newTemplateFooter = 'new footer';
  const newTemplateSampleDeclaration = 'new sample declaration';
  const newDummyData = 'new dummy data';

  let template =
    await experimentSafetyPdfTemplateMutations.updateExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      {
        experimentSafetyPdfTemplateId: existingPdfTemplateId,
        templateData: newTemplateData,
        templateHeader: newTemplateHeader,
        templateFooter: newTemplateFooter,
        templateSampleDeclaration: newTemplateSampleDeclaration,
        dummyData: newDummyData,
      }
    );

  expect(isRejection(template)).toBe(false);
  template = template as ExperimentSafetyPdfTemplate;
  expect(template.experimentSafetyPdfTemplateId).toEqual(existingPdfTemplateId);
  expect(template.templateData).toEqual(newTemplateData);
  expect(template.templateHeader).toEqual(newTemplateHeader);
  expect(template.templateFooter).toEqual(newTemplateFooter);
  expect(template.templateSampleDeclaration).toEqual(
    newTemplateSampleDeclaration
  );
  expect(template.dummyData).toEqual(newDummyData);
});

test('A user cannot update a PDF template', async () => {
  const existingPdfTemplateId = 1;
  const newTemplateData = 'new data';
  const newTemplateHeader = 'new header';
  const newTemplateFooter = 'new footer';
  const newTemplateSampleDeclaration = 'new sample declaration';
  const newDummyData = 'new dummy data';

  const template =
    await experimentSafetyPdfTemplateMutations.updateExperimentSafetyPdfTemplate(
      dummyUserWithRole,
      {
        experimentSafetyPdfTemplateId: existingPdfTemplateId,
        templateData: newTemplateData,
        templateHeader: newTemplateHeader,
        templateFooter: newTemplateFooter,
        templateSampleDeclaration: newTemplateSampleDeclaration,
        dummyData: newDummyData,
      }
    );

  expect(isRejection(template)).toBe(true);
});

test('Update PDF template database error gives friendly error', async () => {
  const existingPdfTemplateId = 1;
  const newTemplateData = 'new data';
  const newTemplateHeader = 'new header';
  const newTemplateFooter = 'new footer';
  const newTemplateSampleDeclaration = 'new sample declaration';
  const newDummyData = 'new dummy data';

  mockUpdateExperimentSafetyPdfTemplate.mockRejectedValue(
    new Error('Database error')
  );

  const template =
    await experimentSafetyPdfTemplateMutations.updateExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      {
        experimentSafetyPdfTemplateId: existingPdfTemplateId,
        templateData: newTemplateData,
        templateHeader: newTemplateHeader,
        templateFooter: newTemplateFooter,
        templateSampleDeclaration: newTemplateSampleDeclaration,
        dummyData: newDummyData,
      }
    );

  expect(isRejection(template)).toBeTruthy();
});

test('A userofficer can delete a PDF template', async () => {
  const pdfTemplateId = 1;

  const template =
    await experimentSafetyPdfTemplateMutations.deleteExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      pdfTemplateId
    );

  expect(template instanceof ExperimentSafetyPdfTemplate).toBe(true);
  expect(
    (template as ExperimentSafetyPdfTemplate).experimentSafetyPdfTemplateId
  ).toEqual(pdfTemplateId);
});

test('A user cannot delete a PDF template', async () => {
  const experimentSafetyPdfTemplateId = 1;

  const template =
    await experimentSafetyPdfTemplateMutations.deleteExperimentSafetyPdfTemplate(
      dummyUserWithRole,
      experimentSafetyPdfTemplateId
    );

  expect(isRejection(template)).toBeTruthy();
});

test('Delete PDF template database error gives friendly error', async () => {
  const experimentSafetyPdfTemplateId = 1;

  mockDeleteExperimentSafetyPdfTemplate.mockRejectedValue(
    new Error('Database error')
  );

  const template =
    await experimentSafetyPdfTemplateMutations.deleteExperimentSafetyPdfTemplate(
      dummyUserOfficerWithRole,
      experimentSafetyPdfTemplateId
    );

  expect(isRejection(template)).toBeTruthy();
});
