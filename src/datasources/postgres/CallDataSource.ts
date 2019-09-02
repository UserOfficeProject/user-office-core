import { CallDataSource } from "../CallDataSource";
import { Call } from "../../models/Call";
import { CallRecord } from "./records";

import database from "./database";

export default class PostgresCallDataSource implements CallDataSource {
  private createCallObject(call: CallRecord) {
    return new Call(
      call.call_id,
      call.call_short_code,
      call.start_call,
      call.end_call,
      call.start_review,
      call.end_review,
      call.start_notify,
      call.end_notify,
      call.cycle_comment,
      call.survey_comment
    );
  }

  async get(id: number) {
    return database
      .select()
      .from("call")
      .where("call_id", id)
      .first()
      .then((call: CallRecord) => this.createCallObject(call));
  }

  async getCalls() {
    return database
      .select(["*"])
      .from("call")
      .then((callDB: CallRecord[]) =>
        callDB.map(call => this.createCallObject(call))
      );
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
  ): Promise<Call | null> {
    return database
      .insert({
        call_short_code: shortCode,
        start_call: startCall,
        end_call: endCall,
        start_review: startReview,
        end_review: endReview,
        start_notify: startNotify,
        end_notify: endNotify,
        cycle_comment: cycleComment,
        survey_comment: surveyComment
      })
      .into("call")
      .returning(["*"])
      .then((call: CallRecord[]) => {
        return this.createCallObject(call[0]);
      })
      .catch(() => {
        return null;
      });
  }
}
