import 'reflect-metadata';

export class FeedbackRequest {
  constructor(
    public id: number,
    public scheduledEventId: number,
    public requestedAt: Date
  ) {}
}
