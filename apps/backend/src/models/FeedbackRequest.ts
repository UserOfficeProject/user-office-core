import 'reflect-metadata';

export class FeedbackRequest {
  constructor(
    public id: number,
    public experimentPk: number,
    public requestedAt: Date
  ) {}
}
