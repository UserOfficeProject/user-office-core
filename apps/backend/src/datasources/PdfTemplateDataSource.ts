import { PdfTemplate } from '../models/PdfTemplate';
import { CreatePdfTemplateInput } from '../resolvers/mutations/CreatePdfTemplateMutation';
import { UpdatePdfTemplateArgs } from '../resolvers/mutations/UpdatePdfTemplateMutation';
import { PdfTemplatesArgs } from '../resolvers/queries/PdfTemplatesQuery';

export type CreatePdfTemplateInputWithCreator = CreatePdfTemplateInput & {
  creatorId: number;
};

export interface PdfTemplateDataSource {
  delete(pdfTemplateId: number): Promise<PdfTemplate>;
  clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<PdfTemplate>;
  updatePdfTemplate(args: UpdatePdfTemplateArgs): Promise<PdfTemplate>;
  createPdfTemplate(
    args: CreatePdfTemplateInputWithCreator
  ): Promise<PdfTemplate>;
  getPdfTemplate(pdfTemplateId: number): Promise<PdfTemplate | null>;
  getPdfTemplates(args: PdfTemplatesArgs): Promise<PdfTemplate[]>;
}
