export class Role {
  constructor(
    public id: number,
    public shortCode: string,
    public title: string,
    public description: string,
    public permissions: string[], // New field for permissions
    public dataAccess: string[] // New field for data access
  ) {}
}

export enum Roles {
  USER = 'user',
  USER_OFFICER = 'user_officer',
  FAP_CHAIR = 'fap_chair',
  FAP_SECRETARY = 'fap_secretary',
  FAP_REVIEWER = 'fap_reviewer',
  INSTRUMENT_SCIENTIST = 'instrument_scientist',
  EXPERIMENT_SAFETY_REVIEWER = 'experiment_safety_reviewer',
  INTERNAL_REVIEWER = 'internal_reviewer',
  DYNAMIC_PROPOSAL_READER = 'dynamic_proposal_reader',
}
