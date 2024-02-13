export class ReviewMeeting {
  constructor(
    public id: number,
    public name: string,
    public details: string | null,
    public creatorId: number,
    public instrumentId: number,
    public notified: boolean,
    public occursAt: Date,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
