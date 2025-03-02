export class VisitRegistration {
  constructor(
    public visitId: number,
    public userId: number,
    public registrationQuestionaryId: number | null,
    public startsAt: Date | null,
    public endsAt: Date | null,
    public trainingExpiryDate: Date | null,
    public status: VisitRegistrationStatus
  ) {}
}

export enum TrainingStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  NONE = 'NONE',
}

export enum VisitRegistrationStatus {
  DRAFTED = 'DRAFTED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  DISAPPROVED = 'DISAPPROVED',
}
