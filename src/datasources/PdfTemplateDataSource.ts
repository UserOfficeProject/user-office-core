import { PdfTemplate } from '../models/PdfTemplate';
import { UpdatePdfTemplateArgs } from '../resolvers/mutations/UpdatePdfTemplateMutation';
import { PdfTemplatesArgs } from '../resolvers/queries/PdfTemplatesQuery';

export interface PdfTemplateDataSource {
  delete(pdfTemplateId: number): Promise<PdfTemplate>;
  clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<PdfTemplate>;
  updatePdfTemplate(args: UpdatePdfTemplateArgs): Promise<PdfTemplate>;
  create(
    templateId: number,
    templateData: string,
    creatorId: number
  ): Promise<PdfTemplate>;
  getPdfTemplate(pdfTemplateId: number): Promise<PdfTemplate | null>;
  getPdfTemplates(args: PdfTemplatesArgs): Promise<PdfTemplate[]>;
}
