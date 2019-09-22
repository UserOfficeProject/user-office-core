import AdminQueries from "./AdminQueries";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import { proposalDataSource } from "../datasources/mockups/ProposalDataSource";
import { adminDataSource } from "../datasources/mockups/AdminDataSource";
import {
  userDataSource,
  dummyUser
} from "../datasources/mockups/UserDataSource";

const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource(),
  new reviewDataSource()
);
const adminQueries = new AdminQueries(new adminDataSource(), userAuthorization);

test("A user can get page text", () => {
  return expect(adminQueries.getPageText(dummyUser, 1)).resolves.toBe(
    "HELLO WORLD"
  );
});

test("A not logged in user can not get page text", () => {
  return expect(adminQueries.getPageText(null, 1)).resolves.toBe(null);
});
