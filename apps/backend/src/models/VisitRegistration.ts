export class VisitRegistration {
  constructor(
    public userId: number,
    public visitId: number,
    public registrationQuestionaryId: number | null,
    public isRegistrationSubmitted: boolean,
    public startsAt: Date | null,
    public endsAt: Date | null,
    public trainingExpiryDate: Date | null
  ) {}
}

export enum TrainingStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  NONE = 'none',
}
