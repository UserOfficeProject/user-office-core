export class Settings {
  constructor(
    public id: SettingsId,
    public settingsValue: string,
    public description: string
  ) {}
}

export enum SettingsId {
  EXTERNAL_AUTH_LOGOUT_URL = 'EXTERNAL_AUTH_LOGOUT_URL',
  EXTERNAL_AUTH_LOGIN_URL = 'EXTERNAL_AUTH_LOGIN_URL',
  PROFILE_PAGE_LINK = 'PROFILE_PAGE_LINK',
  PALETTE_PRIMARY_DARK = 'PALETTE_PRIMARY_DARK',
  PALETTE_PRIMARY_MAIN = 'PALETTE_PRIMARY_MAIN',
  PALETTE_PRIMARY_ACCENT = 'PALETTE_PRIMARY_ACCENT',
  PALETTE_PRIMARY_LIGHT = 'PALETTE_PRIMARY_LIGHT',
  PALETTE_PRIMARY_CONTRAST = 'PALETTE_PRIMARY_CONTRAST',
  PALETTE_SECONDARY_DARK = 'PALETTE_SECONDARY_DARK',
  PALETTE_SECONDARY_MAIN = 'PALETTE_SECONDARY_MAIN',
  PALETTE_SECONDARY_LIGHT = 'PALETTE_SECONDARY_LIGHT',
  PALETTE_SECONDARY_CONTRAST = 'PALETTE_SECONDARY_CONTRAST',
  PALETTE_ERROR_MAIN = 'PALETTE_ERROR_MAIN',
  PALETTE_SUCCESS_MAIN = 'PALETTE_SUCCESS_MAIN',
  PALETTE_WARNING_MAIN = 'PALETTE_WARNING_MAIN',
  PALETTE_INFO_MAIN = 'PALETTE_INFO_MAIN',
  HEADER_LOGO_FILENAME = 'HEADER_LOGO_FILENAME',
  FEEDBACK_MAX_REQUESTS = '2',
  FEEDBACK_FREQUENCY_DAYS = '14',
  FEEDBACK_EXHAUST_DAYS = '90',
  DEFAULT_NUM_REVIEWS_REQUIRED = '2',
  TIMEZONE = 'TIMEZONE',
  DATE_FORMAT = 'DATE_FORMAT',
  DATE_TIME_FORMAT = 'DATE_TIME_FORMAT',
  DEFAULT_INST_SCI_STATUS_FILTER = 'DEFAULT_INST_SCI_STATUS_FILTER',
  DEFAULT_INST_SCI_REVIEWER_FILTER = 'DEFAULT_INST_SCI_REVIEWER_FILTER',
  IDLE_TIMEOUT = 'IDLE_TIMEOUT',
  GRADE_PRECISION = 'GRADE_PRECISION',
}
