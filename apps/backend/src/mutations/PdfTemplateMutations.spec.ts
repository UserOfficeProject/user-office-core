import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PdfTemplateDataSourceMock } from '../datasources/mockups/PdfTemplateDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { PdfTemplate } from '../models/PdfTemplate';
import { isRejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { Template } from '../models/Template';
import PdfTemplateMutations from './PdfTemplateMutations';

const pdfTemplateMutations = container.resolve(PdfTemplateMutations);

const mockGetTemplate = jest.spyOn(
  TemplateDataSourceMock.prototype,
  'getTemplate'
);

const mockCreatePdfTemplate = jest.spyOn(
  PdfTemplateDataSourceMock.prototype,
  'createPdfTemplate'
);

const mockUpdatePdfTemplate = jest.spyOn(
  PdfTemplateDataSourceMock.prototype,
  'updatePdfTemplate'
);

const mockDeletePdfTemplate = jest.spyOn(
  PdfTemplateDataSourceMock.prototype,
  'delete'
);

beforeEach(() => {
  container
    .resolve<PdfTemplateDataSourceMock>(Tokens.PdfTemplateDataSource)
    .init();
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();

  mockGetTemplate.mockClear();
  mockCreatePdfTemplate.mockClear();
  mockDeletePdfTemplate.mockClear();
});

test('A userofficer can create a PDF template', async () => {
  const templateId = 1;
  const templateData = '...';
  const templateHeader = '...';
  const templateFooter = '...';
  const templateSampleDeclaration = '...';
  const dummyData = '...';

  mockGetTemplate.mockImplementation((templateId: number) =>
    Promise.resolve(
      new Template(templateId, TemplateGroupId.PDF_TEMPLATE, '', '', false)
    )
  );

  let template = await pdfTemplateMutations.createPdfTemplate(
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

  expect(template instanceof PdfTemplate).toBe(true);
  template = template as PdfTemplate;
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
      new Template(templateId, TemplateGroupId.PDF_TEMPLATE, '', '', false)
    )
  );

  const template = await pdfTemplateMutations.createPdfTemplate(
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

  expect(template instanceof PdfTemplate).toBe(false);
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

  const template = await pdfTemplateMutations.createPdfTemplate(
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
      new Template(templateId, TemplateGroupId.PDF_TEMPLATE, '', '', false)
    )
  );

  mockCreatePdfTemplate.mockRejectedValue(new Error('Database error'));

  const template = await pdfTemplateMutations.createPdfTemplate(
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

  let template = await pdfTemplateMutations.updatePdfTemplate(
    dummyUserOfficerWithRole,
    {
      pdfTemplateId: existingPdfTemplateId,
      templateData: newTemplateData,
      templateHeader: newTemplateHeader,
      templateFooter: newTemplateFooter,
      templateSampleDeclaration: newTemplateSampleDeclaration,
      dummyData: newDummyData,
    }
  );

  expect(isRejection(template)).toBe(false);
  template = template as PdfTemplate;
  expect(template.pdfTemplateId).toEqual(existingPdfTemplateId);
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

  const template = await pdfTemplateMutations.updatePdfTemplate(
    dummyUserWithRole,
    {
      pdfTemplateId: existingPdfTemplateId,
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

  mockUpdatePdfTemplate.mockRejectedValue(new Error('Database error'));

  const template = await pdfTemplateMutations.updatePdfTemplate(
    dummyUserOfficerWithRole,
    {
      pdfTemplateId: existingPdfTemplateId,
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

  const template = await pdfTemplateMutations.deletePdfTemplate(
    dummyUserOfficerWithRole,
    pdfTemplateId
  );

  expect(template instanceof PdfTemplate).toBe(true);
  expect((template as PdfTemplate).pdfTemplateId).toEqual(pdfTemplateId);
});

test('A user cannot delete a PDF template', async () => {
  const pdfTemplateId = 1;

  const template = await pdfTemplateMutations.deletePdfTemplate(
    dummyUserWithRole,
    pdfTemplateId
  );

  expect(isRejection(template)).toBeTruthy();
});

test('Delete PDF template database error gives friendly error', async () => {
  const pdfTemplateId = 1;

  mockDeletePdfTemplate.mockRejectedValue(new Error('Database error'));

  const template = await pdfTemplateMutations.deletePdfTemplate(
    dummyUserOfficerWithRole,
    pdfTemplateId
  );

  expect(isRejection(template)).toBeTruthy();
});
