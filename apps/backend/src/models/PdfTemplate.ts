export class PdfTemplate {
  constructor(
    public pdfTemplateId: number,
    public templateId: number,
    public templateData: string,
    public templateHeader: string,
    public templateFooter: string,
    public templateSampleDeclaration: string,
    public creatorId: number,
    public created: Date
  ) {}
}
