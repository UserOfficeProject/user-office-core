export class VisitRegistration {
  constructor(
    public visitId: number,
    public userId: number,
    public registrationQuestionaryId: number | null,
    public startsAt: Date | null,
    public endsAt: Date | null,
    public status: VisitRegistrationStatus
  ) {}
}

export enum VisitRegistrationStatus {
  DRAFTED = 'DRAFTED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  CHANGE_REQUESTED = 'CHANGE_REQUESTED',
  CANCELLED_BY_USER = 'CANCELLED_BY_USER',
  CANCELLED_BY_FACILITY = 'CANCELLED_BY_FACILITY',
}
