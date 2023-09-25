import { PdfTemplate } from '../../models/PdfTemplate';
import { UpdatePdfTemplateArgs } from '../../resolvers/mutations/UpdatePdfTemplateMutation';
import { PdfTemplatesArgs } from '../../resolvers/queries/PdfTemplatesQuery';
import {
  CreatePdfTemplateInputWithCreator,
  PdfTemplateDataSource,
} from '../PdfTemplateDataSource';

export let dummyPdfTemplate: PdfTemplate;

const dummyPdfTemplateFactory = (values?: Partial<PdfTemplate>) => {
  return new PdfTemplate(
    values?.pdfTemplateId || 1,
    values?.templateId || 1,
    values?.templateData || '...',
    values?.templateHeader || '...',
    values?.templateFooter || '...',
    values?.templateSampleDeclaration || '...',
    values?.creatorId || 1,
    values?.created || new Date()
  );
};

export class PdfTemplateDataSourceMock implements PdfTemplateDataSource {
  public init() {
    dummyPdfTemplate = dummyPdfTemplateFactory();
  }

  constructor() {
    this.init();
  }

  async delete(pdfTemplateId: number): Promise<PdfTemplate> {
    if (dummyPdfTemplate.pdfTemplateId !== pdfTemplateId) {
      throw new Error(`Template with ID ${pdfTemplateId} does not exist`);
    }

    const copyOfTemplate = dummyPdfTemplateFactory(dummyPdfTemplate);
    dummyPdfTemplate.pdfTemplateId = 999; // mocking deleting template with ID

    return copyOfTemplate;
  }

  async clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<PdfTemplate> {
    return dummyPdfTemplate;
  }

  async updatePdfTemplate(args: UpdatePdfTemplateArgs): Promise<PdfTemplate> {
    dummyPdfTemplate = { ...dummyPdfTemplate, ...args };

    return dummyPdfTemplate;
  }

  async createPdfTemplate({
    templateId,
    templateData,
    templateHeader,
    templateFooter,
    templateSampleDeclaration,
    creatorId,
  }: CreatePdfTemplateInputWithCreator): Promise<PdfTemplate> {
    dummyPdfTemplate = dummyPdfTemplateFactory({
      templateId,
      templateData,
      templateHeader,
      templateFooter,
      templateSampleDeclaration,
      creatorId,
    });

    return dummyPdfTemplate;
  }

  async getPdfTemplate(pdfTemplateId: number): Promise<PdfTemplate | null> {
    return dummyPdfTemplate;
  }

  async getPdfTemplates(args: PdfTemplatesArgs): Promise<PdfTemplate[]> {
    return [dummyPdfTemplate];
  }
}
