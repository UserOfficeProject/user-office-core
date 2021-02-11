export class Permissions {
  constructor(
    public id: string,
    public name: string,
    public accessToken: string,
    public accessPermissions: any | null
  ) {}
}
