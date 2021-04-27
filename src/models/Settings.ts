export class Settings {
  constructor(
    public id: SettingsId,
    public settingsValue: string,
    public description: string
  ) {}
}

export enum SettingsId {
  externalAuthLoginUrl = 'externalAuthLoginUrl',
}
