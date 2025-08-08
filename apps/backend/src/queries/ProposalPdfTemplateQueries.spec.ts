import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalPdfTemplate } from '../models/ProposalPdfTemplate';
import ProposalPdfTemplateQueries from './ProposalPdfTemplateQueries';

const proposalPdfTemplateQueries = container.resolve(
  ProposalPdfTemplateQueries
);
beforeEach(() => {
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
});

test('A userofficer can get a Proposal PDF template', () => {
  return expect(
    proposalPdfTemplateQueries.getProposalPdfTemplate(
      dummyUserOfficerWithRole,
      1
    )
  ).resolves.toBeInstanceOf(ProposalPdfTemplate);
});

test('A user can get a Proposal PDF template', () => {
  return expect(
    proposalPdfTemplateQueries.getProposalPdfTemplate(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(ProposalPdfTemplate);
});

test('A userofficer can get multiple Proposal PDF templates', async () => {
  const pdfTemplates = await proposalPdfTemplateQueries.getProposalPdfTemplates(
    dummyUserOfficerWithRole,
    {
      filter: {
        proposalPdfTemplateIds: [1],
      },
    }
  );

  expect(pdfTemplates.length).toBeGreaterThan(0);
});

test('A user can get multiple Proposal PDF templates', async () => {
  const pdfTemplates = await proposalPdfTemplateQueries.getProposalPdfTemplates(
    dummyUserWithRole,
    {
      filter: {
        proposalPdfTemplateIds: [1],
      },
    }
  );

  expect(pdfTemplates.length).toBeGreaterThan(0);
});
