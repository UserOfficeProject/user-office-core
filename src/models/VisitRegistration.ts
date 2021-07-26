export class VisitRegistration {
  constructor(
    public userId: number,
    public visitId: number,
    public registrationQuestionaryId: number | null,
    public isRegistrationSubmitted: boolean,
    public trainingExpiryDate: Date | null
  ) {}
}
