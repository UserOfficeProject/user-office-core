import { AdminDataSource } from "../AdminDataSource";

export class adminDataSource implements AdminDataSource {
  async getInstitutions(): Promise<import("../AdminDataSource").Entry[]> {
    throw new Error("Method not implemented.");
  }
  async getCountries(): Promise<import("../AdminDataSource").Entry[]> {
    throw new Error("Method not implemented.");
  }
  async getNationalities(): Promise<import("../AdminDataSource").Entry[]> {
    throw new Error("Method not implemented.");
  }
  async get(id: number): Promise<string | null> {
    return "HELLO WORLD";
  }
  async setPageText(id: number, text: string): Promise<Boolean> {
    return true;
  }
}
