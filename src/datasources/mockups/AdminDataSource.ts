import { AdminDataSource, Entry } from "../AdminDataSource";
import { Page } from "../../models/Admin";

export class adminDataSource implements AdminDataSource {
  getInstitution(id: number): Promise<string | null> {
    throw new Error("Method not implemented.");
  }
  async getInstitutions(): Promise<Entry[]> {
    throw new Error("Method not implemented.");
  }
  async getCountries(): Promise<Entry[]> {
    throw new Error("Method not implemented.");
  }
  async getNationalities(): Promise<Entry[]> {
    throw new Error("Method not implemented.");
  }
  async get(id: number) {
    return "HELLO WORLD";
  }
  async setPageText(id: number, text: string) {
    return new Page(id, text);
  }
}
