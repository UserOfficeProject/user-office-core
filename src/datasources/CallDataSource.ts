import { Call } from "../models/Call";

export interface CallDataSource {
  // Read
  get(id: number): Promise<Call | null>;
  getCalls(): Promise<Call[]>;
  // Write
  create(
    shortCode: string,
    startCall: string,
    endCall: string,
    startReview: string,
    endReview: string,
    startNotify: string,
    endNotify: string,
    cycleComment: string,
    surveyComment: string
  ): Promise<Call>;
}
