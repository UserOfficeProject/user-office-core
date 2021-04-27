export class Settings {
  constructor(
    public id: SettingsId,
    public settingsValue: string,
    public description: string
  ) {}
}

export enum SettingsId {
  EXTERNAL_AUTH_LOGIN_URL = 'EXTERNAL_AUTH_LOGIN_URL',
}
