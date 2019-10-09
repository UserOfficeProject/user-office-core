import { AdminDataSource } from "../AdminDataSource";

export class adminDataSource implements AdminDataSource {
  async get(id: number): Promise<string | null> {
    return "HELLO WORLD";
  }
  async setPageText(id: number, text: string): Promise<Boolean> {
    return true;
  }
}
