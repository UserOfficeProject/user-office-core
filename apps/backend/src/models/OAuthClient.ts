export class OAuthClient {
  constructor(
    /** The client id as it is registered in the external identity provider */
    public id: string,
    public name: string,
    public description: string | null,
    public accessPermissions: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
