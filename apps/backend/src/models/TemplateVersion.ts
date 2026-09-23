export class TemplateVersion {
  constructor(
    public templateVersionId: number,
    public templateId: number,
    public body: string,
    public subject: string,
    public versionNumber: number,
    public templateType: string
  ) {}
}
