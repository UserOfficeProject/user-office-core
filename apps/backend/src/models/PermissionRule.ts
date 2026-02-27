export class PermissionRule {
  constructor(
    public id: number,
    public role: string,
    public subject: string,
    public action: string,
    public conditions: string | null
  ) {}
}