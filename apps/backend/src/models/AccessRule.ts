export class AccessRule {
  constructor(
    public id: number,
    public role: string,
    public role_id: number,
    public subject: string,
    public action: string,
    public conditions: string
  ) {}
}