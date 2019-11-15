import AdminQueries from "./AdminQueries";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import { adminDataSource } from "../datasources/mockups/AdminDataSource";
import {
  userDataSource,
  dummyUser
} from "../datasources/mockups/UserDataSource";

const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const adminQueries = new AdminQueries(new adminDataSource(), userAuthorization);

test("A user can get page text", () => {
  return expect(adminQueries.getPageText(1)).resolves.toBe("HELLO WORLD");
});
