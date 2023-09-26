import 'reflect-metadata';

export class Feedback {
  constructor(
    public id: number,
    public scheduledEventId: number,
    public status: FeedbackStatus,
    public questionaryId: number,
    public creatorId: number,
    public createdAt: Date,
    public submittedAt: Date | null
  ) {}
}

export enum FeedbackStatus {
  'DRAFT' = 'DRAFT',
  'SUBMITTED' = 'SUBMITTED',
}
