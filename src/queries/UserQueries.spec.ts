import UserQueries from "./UserQueries";
import { UserDataSource } from "../datasources/UserDataSource";
import User from "../models/User";

const dummyUserOfficer = new User(4, "John", "Doe", ["User_Officer"]);
const dummyUser = new User(5, "Jane", "Doe", ["User"]);
const userDataSource: UserDataSource = {
  // Read
  get: async (id: number) => dummyUser,
  getUsers: async () => [dummyUser, dummyUserOfficer],
  getProposalUsers: async (proposalID: number) => [dummyUser, dummyUserOfficer],
  // Write
  create: async (firstname: string, lastname: string) => dummyUser
};

const userQueries = new UserQueries(userDataSource);

test("A user officer fetch can fetch any user account", () => {
  expect(userQueries.get(dummyUser.id, dummyUserOfficer)).resolves.toBe(
    dummyUser
  );
});

test("A user is allowed to fetch it's own account ", () => {
  expect(userQueries.get(dummyUser.id, dummyUser)).resolves.toBe(dummyUser);
});

test("A user is not allowed to fetch other peoples account ", () => {
  expect(userQueries.get(dummyUserOfficer.id, dummyUser)).resolves.toBe(null);
});

test("A user officer is allowed to fetch all accounts", () => {
  expect(userQueries.getAll(dummyUserOfficer)).resolves.toStrictEqual([
    dummyUser,
    dummyUserOfficer
  ]);
});

test("A user is not allowed to fetch all accounts", () => {
  expect(userQueries.getAll(dummyUser)).resolves.toBe(null);
});
