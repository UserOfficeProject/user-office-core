import UserQueries from "./UserQueries";
import {
  userDataSource,
  dummyUser,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";
import { proposalDataSource } from "../datasources/mockups/ProposalDataSource";
import { UserAuthorization } from "../utils/UserAuthorization";

const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource()
);
const userQueries = new UserQueries(new userDataSource(), userAuthorization);

test("A user officer fetch can fetch any user account", () => {
  return expect(userQueries.get(dummyUser.id, dummyUserOfficer)).resolves.toBe(
    dummyUser
  );
});

test("A user is allowed to fetch it's own account ", () => {
  return expect(userQueries.get(dummyUser.id, dummyUser)).resolves.toBe(
    dummyUser
  );
});

test("A user is not allowed to fetch other peoples account ", () => {
  return expect(userQueries.get(dummyUserOfficer.id, dummyUser)).resolves.toBe(
    null
  );
});

test("A user officer is allowed to fetch all accounts", () => {
  return expect(userQueries.getAll(dummyUserOfficer)).resolves.toStrictEqual([
    dummyUser,
    dummyUserOfficer
  ]);
});

test("A user is allowed to fetch all accounts", () => {
  return expect(userQueries.getAll(dummyUser)).resolves.toStrictEqual([
    dummyUser,
    dummyUserOfficer
  ]);
});
