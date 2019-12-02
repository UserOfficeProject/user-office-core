import AdminMutations from "./AdminMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import { ApplicationEvent } from "../events/applicationEvents";
import { adminDataSource } from "../datasources/mockups/AdminDataSource";
import {
  userDataSource,
  dummyUser,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";
import { rejection } from "../rejection";
import { Page } from "../models/Admin";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const adminMutations = new AdminMutations(
  new adminDataSource(),
  userAuthorization,
  dummyEventBus
);

test("A user can not set page text", () => {
  return expect(
    adminMutations.setPageText(null, 1, "New page contents")
  ).resolves.not.toBeInstanceOf(Page);
});

test("A user officer can set page text", () => {
  return expect(
    adminMutations.setPageText(dummyUserOfficer, 1, "")
  ).resolves.toBeInstanceOf(Page);
});
