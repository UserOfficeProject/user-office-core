import { CallDataSource } from "../CallDataSource";
import { Call } from "../../models/Call";
import { CallRecord } from "./records";

import database from "./database";
import { CreateCallArgs } from "../../resolvers/mutations/CreateCallMutation";

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

  async get(id: number): Promise<Call | null> {
    return database
      .select()
      .from("call")
      .where("call_id", id)
      .first()
      .then((call: CallRecord | null) =>
        call ? this.createCallObject(call) : null
      );
  }

  async getCalls(): Promise<Call[]> {
    return database
      .select(["*"])
      .from("call")
      .then((callDB: CallRecord[]) =>
        callDB.map(call => this.createCallObject(call))
      );
  }

  async create(args: CreateCallArgs): Promise<Call> {
    return database
      .insert({
        call_short_code: args.shortCode,
        start_call: args.startCall,
        end_call: args.endCall,
        start_review: args.startReview,
        end_review: args.endReview,
        start_notify: args.startNotify,
        end_notify: args.endNotify,
        cycle_comment: args.cycleComment,
        survey_comment: args.surveyComment
      })
      .into("call")
      .returning(["*"])
      .then((call: CallRecord[]) => {
        if (call.length !== 1) {
          throw new Error("Could not create call");
        }
        return this.createCallObject(call[0]);
      });
  }
}
