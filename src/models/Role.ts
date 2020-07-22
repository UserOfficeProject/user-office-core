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
  REVIEWER = 'reviewer',
  SEP_CHAIR = 'SEP_Chair',
  SEP_SECRETARY = 'SEP_Secretary',
  SEP_REVIEWER = 'SEP_Reviewer',
  INSTRUMENT_SCIENTIST = 'instrument_scientist',
}
