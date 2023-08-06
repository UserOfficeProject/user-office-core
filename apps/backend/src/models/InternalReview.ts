export class InternalReview {
  constructor(
    public id: number,
    public title: string | null,
    public comment: string | null,
    public files: string | null,
    public reviewerId: number,
    public technicalReviewId: number,
    public assignedBy: number,
    public createdAt: Date
  ) {}
}
