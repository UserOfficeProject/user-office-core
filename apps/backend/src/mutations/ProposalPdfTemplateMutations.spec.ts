import { container } from 'tsyringe';

import ProposalPdfTemplateMutations from './ProposalPdfTemplateMutations';
import { Tokens } from '../config/Tokens';
import { ProposalPdfTemplateDataSourceMock } from '../datasources/mockups/ProposalPdfTemplateDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalPdfTemplate } from '../models/ProposalPdfTemplate';
import { isRejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { Template } from '../models/Template';

const proposalPdfTemplateMutations = container.resolve(
  ProposalPdfTemplateMutations
);

const mockGetTemplate = jest.spyOn(
  TemplateDataSourceMock.prototype,
  'getTemplate'
);

const mockCreateProposalPdfTemplate = jest.spyOn(
  ProposalPdfTemplateDataSourceMock.prototype,
  'createPdfTemplate'
);

const mockUpdateProposalPdfTemplate = jest.spyOn(
  ProposalPdfTemplateDataSourceMock.prototype,
  'updatePdfTemplate'
);

const mockDeleteProposalPdfTemplate = jest.spyOn(
  ProposalPdfTemplateDataSourceMock.prototype,
  'delete'
);

beforeEach(() => {
  container
    .resolve<ProposalPdfTemplateDataSourceMock>(
      Tokens.ProposalPdfTemplateDataSource
    )
    .init();
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();

  mockGetTemplate.mockClear();
  mockCreateProposalPdfTemplate.mockClear();
  mockDeleteProposalPdfTemplate.mockClear();
});

test('A userofficer can create a Proposal PDF template', async () => {
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

  let template = await proposalPdfTemplateMutations.createProposalPdfTemplate(
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

  expect(template instanceof ProposalPdfTemplate).toBe(true);
  template = template as ProposalPdfTemplate;
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

  const template = await proposalPdfTemplateMutations.createProposalPdfTemplate(
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

  expect(template instanceof ProposalPdfTemplate).toBe(false);
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

  const template = await proposalPdfTemplateMutations.createProposalPdfTemplate(
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

  mockCreateProposalPdfTemplate.mockRejectedValue(new Error('Database error'));

  const template = await proposalPdfTemplateMutations.createProposalPdfTemplate(
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

  let template = await proposalPdfTemplateMutations.updateProposalPdfTemplate(
    dummyUserOfficerWithRole,
    {
      proposalPdfTemplateId: existingPdfTemplateId,
      templateData: newTemplateData,
      templateHeader: newTemplateHeader,
      templateFooter: newTemplateFooter,
      templateSampleDeclaration: newTemplateSampleDeclaration,
      dummyData: newDummyData,
    }
  );

  expect(isRejection(template)).toBe(false);
  template = template as ProposalPdfTemplate;
  expect(template.proposalPdfTemplateId).toEqual(existingPdfTemplateId);
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

  const template = await proposalPdfTemplateMutations.updateProposalPdfTemplate(
    dummyUserWithRole,
    {
      proposalPdfTemplateId: existingPdfTemplateId,
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

  mockUpdateProposalPdfTemplate.mockRejectedValue(new Error('Database error'));

  const template = await proposalPdfTemplateMutations.updateProposalPdfTemplate(
    dummyUserOfficerWithRole,
    {
      proposalPdfTemplateId: existingPdfTemplateId,
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

  const template = await proposalPdfTemplateMutations.deleteProposalPdfTemplate(
    dummyUserOfficerWithRole,
    pdfTemplateId
  );

  expect(template instanceof ProposalPdfTemplate).toBe(true);
  expect((template as ProposalPdfTemplate).proposalPdfTemplateId).toEqual(
    pdfTemplateId
  );
});

test('A user cannot delete a PDF template', async () => {
  const proposalPdfTemplateId = 1;

  const template = await proposalPdfTemplateMutations.deleteProposalPdfTemplate(
    dummyUserWithRole,
    proposalPdfTemplateId
  );

  expect(isRejection(template)).toBeTruthy();
});

test('Delete PDF template database error gives friendly error', async () => {
  const proposalPdfTemplateId = 1;

  mockDeleteProposalPdfTemplate.mockRejectedValue(new Error('Database error'));

  const template = await proposalPdfTemplateMutations.deleteProposalPdfTemplate(
    dummyUserOfficerWithRole,
    proposalPdfTemplateId
  );

  expect(isRejection(template)).toBeTruthy();
});
