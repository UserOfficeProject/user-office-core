import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { PdfTemplate } from '../models/PdfTemplate';
import PdfTemplateQueries from './PdfTemplateQueries';

const pdfTemplateQueries = container.resolve(PdfTemplateQueries);
beforeEach(() => {
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
});

test('A userofficer can get a PDF template', () => {
  return expect(
    pdfTemplateQueries.getPdfTemplate(dummyUserOfficerWithRole, 1)
  ).resolves.toBeInstanceOf(PdfTemplate);
});

test('A user can get a PDF template', () => {
  return expect(
    pdfTemplateQueries.getPdfTemplate(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(PdfTemplate);
});

test('A userofficer can get multiple PDF templates', async () => {
  const pdfTemplates = await pdfTemplateQueries.getPdfTemplates(
    dummyUserOfficerWithRole,
    {
      filter: {
        pdfTemplateIds: [1],
      },
    }
  );

  expect(pdfTemplates.length).toBeGreaterThan(0);
});

test('A user can get multiple PDF templates', async () => {
  const pdfTemplates = await pdfTemplateQueries.getPdfTemplates(
    dummyUserWithRole,
    {
      filter: {
        pdfTemplateIds: [1],
      },
    }
  );

  expect(pdfTemplates.length).toBeGreaterThan(0);
});
