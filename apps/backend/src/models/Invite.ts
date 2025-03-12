export class Invite {
  constructor(
    public id: number,
    public code: string,
    public email: string,
    public note: string,
    public createdAt: Date,
    public createdByUserId: number,
    public claimedAt: Date | null,
    public claimedByUserId: number | null
  ) {}
}
