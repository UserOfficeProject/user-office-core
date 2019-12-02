import { CallDataSource } from "../CallDataSource";
import { Call } from "../../models/Call";

export const dummyCall = new Call(
  1,
  "shortCode",
  new Date("2019-07-17 08:25:12.23043+00"),
  new Date("2019-07-17 08:25:12.23043+00"),
  new Date("2019-07-17 08:25:12.23043+00"),
  new Date("2019-07-17 08:25:12.23043+00"),
  new Date("2019-07-17 08:25:12.23043+00"),
  new Date("2019-07-17 08:25:12.23043+00"),
  "",
  ""
);

export class callDataSource implements CallDataSource {
  async get(id: number): Promise<Call | null> {
    return dummyCall;
  }

  async getCalls(): Promise<Call[]> {
    return [dummyCall];
  }
  async create(
    shortCode: string,
    startCall: string,
    endCall: string,
    startReview: string,
    endReview: string,
    startNotify: string,
    endNotify: string,
    cycleComment: string,
    surveyComment: string
  ) {
    return dummyCall;
  }
}
