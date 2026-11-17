export class TemplateVersion {
  constructor(
    public templateVersionId: number,
    public templateId: number,
    public template: string,
    public versionNumber: number,
    public templateType: string,
    public createdTimeStamp: string
  ) {}
}
