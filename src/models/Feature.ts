export class Feature {
  constructor(
    public id: FeatureId,
    public isEnabled: boolean,
    public description: string
  ) {}
}

export enum FeatureId {
  SHIPPING = 'SHIPPING',
  SCHEDULER = 'SCHEDULER',
  EXTERNAL_AUTH = 'EXTERNAL_AUTH',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  EMAIL_INVITE = 'EMAIL_INVITE',
  EMAIL_SEARCH = 'EMAIL_SEARCH',
  INSTRUMENT_MANAGEMENT = 'INSTRUMENT_MANAGEMENT',
  TECHNICAL_REVIEW = 'TECHNICAL_REVIEW',
  SEP_REVIEW = 'SEP_REVIEW',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  VISIT_MANAGEMENT = 'VISIT_MANAGEMENT',
  SAMPLE_SAFETY = 'SAMPLE_SAFETY',
}

export enum FeatureUpdateAction {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}
