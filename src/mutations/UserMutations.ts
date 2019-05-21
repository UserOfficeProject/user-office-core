import User from "../models/User";
import UserDataSource from "../datasources/UserDataSource";

export default class UserMutations {
  constructor(private dataSource: UserDataSource) {}

  async create(firstname: string, lastname: string): Promise<User | null> {
    // Various validation...
    if (firstname !== "" && lastname !== "") {
      return null; // Return rejection instead
    }

    return this.dataSource.create(firstname, lastname);
  }
}
