export class PdfTemplate {
  constructor(
    public pdfTemplateId: number,
    public templateId: number,
    public templateData: string,
    public creatorId: number,
    public created: Date
  ) {}
}
