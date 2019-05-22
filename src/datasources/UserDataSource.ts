import User from "../models/User";

export interface UserDataSource {
  // Read
  get(id: number): Promise<User | null>;
  getUsers(): Promise<User[]>;
  getProposalUsers(proposalId: number): Promise<User[]>;
  // Write
  create(firstname: string, lastname: string): Promise<User | null>;
}
