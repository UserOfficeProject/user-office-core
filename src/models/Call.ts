export class Call {
  constructor(
    public id: number,
    public shortCode: string,
    public startCall: Date,
    public endCall: Date,
    public startReview: Date,
    public endReview: Date,
    public startNotify: Date,
    public endNotify: Date,
    public startCycle: Date,
    public endCycle: Date,
    public cycleComment: string,
    public surveyComment: string,
    public templateId?: number
  ) {}
}
