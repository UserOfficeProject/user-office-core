export class Settings {
  constructor(
    public id: SettingsId,
    public addValue: string,
    public description: string
  ) {}
}

export enum SettingsId {
  EXTERNAL_AUTH_LOGIN_URL = 'EXTERNAL_AUTH_LOGIN_URL',
}
