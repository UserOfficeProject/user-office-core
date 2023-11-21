export class Role {
  constructor(
    public id: number,
    public shortCode: string,
    public title: string
  ) {}
}

export enum Roles {
  USER = 'user',
  USER_OFFICER = 'user_officer',
  FAP_CHAIR = 'fap_chair',
  FAP_SECRETARY = 'fap_secretary',
  FAP_REVIEWER = 'fap_reviewer',
  INSTRUMENT_SCIENTIST = 'instrument_scientist',
  SAMPLE_SAFETY_REVIEWER = 'sample_safety_reviewer',
  INTERNAL_REVIEWER = 'internal_reviewer',
}
