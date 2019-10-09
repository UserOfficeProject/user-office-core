import AdminMutations from "./AdminMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import { ApplicationEvent } from "../events/applicationEvents";
import { proposalDataSource } from "../datasources/mockups/ProposalDataSource";
import { adminDataSource } from "../datasources/mockups/AdminDataSource";
import {
  userDataSource,
  dummyUser,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource(),
  new reviewDataSource()
);
const adminMutations = new AdminMutations(
  new adminDataSource(),
  userAuthorization,
  dummyEventBus
);

test("A user can not set page text", () => {
  return expect(adminMutations.setPageText(dummyUser, 1, "")).resolves.toBe(
    false
  );
});

test("A userofficer can set page text", () => {
  return expect(
    adminMutations.setPageText(dummyUserOfficer, 1, "")
  ).resolves.toBe(true);
});
