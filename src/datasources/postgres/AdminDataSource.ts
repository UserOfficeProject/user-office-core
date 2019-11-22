import { AdminDataSource, Entry } from "../AdminDataSource";
import database from "./database";

export default class PostgresAdminDataSource implements AdminDataSource {
  async get(id: number): Promise<string | null> {
    return database
      .select("content")
      .from("pagetext")
      .where("pagetext_id", id)
      .first()
      .then((res: { content: string }) => res.content);
  }
  async setPageText(id: number, content: string): Promise<Boolean> {
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

  async getNationalities(): Promise<Entry[]> {
    return database
      .select()
      .from("nationalities")
      .then((natDB: any[]) =>
        natDB.map(nat => {
          return { id: nat.nationality_id, value: nat.nationality };
        })
      );
  }

  async getInstitutions(): Promise<Entry[]> {
    return database
      .select()
      .from("institutions")
      .then((intDB: any[]) =>
        intDB.map(int => {
          return { id: int.institution_id, value: int.institution };
        })
      );
  }
  async getCountries(): Promise<Entry[]> {
    return database
      .select()
      .from("countries")
      .then((countDB: any[]) =>
        countDB.map(count => {
          return { id: count.country_id, value: count.country };
        })
      );
  }
}
