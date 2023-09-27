export class RedeemCode {
  constructor(
    public code: string,
    public placeholderUserId: number,
    public createdBy: number,
    public createdAt: Date,
    public claimedBy: number | null,
    public claimedAt: Date | null
  ) {}
}
