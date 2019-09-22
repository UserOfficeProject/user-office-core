import { AdminDataSource } from "../AdminDataSource";
import database from "./database";

export default class PostgresAdminDataSource implements AdminDataSource {
  get(id: number): Promise<string | null> {
    return database
      .select("content")
      .from("pagetext")
      .where("pagetext_id", id)
      .first()
      .then((res: { content: string }) => res.content);
  }
  setPageText(id: number, content: string): Promise<Boolean> {
    return database
      .update({
        content
      })
      .from("pagetext")
      .where("pagetext_id", id)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}
