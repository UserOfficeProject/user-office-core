import "reflect-metadata";
import { adminDataSource } from "../datasources/mockups/AdminDataSource";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import {
  dummyUserOfficer,
  userDataSource
} from "../datasources/mockups/UserDataSource";
import { ApplicationEvent } from "../events/applicationEvents";
import { EventBus } from "../events/eventBus";
import { Page } from "../models/Admin";
import { UserAuthorization } from "../utils/UserAuthorization";
import AdminMutations from "./AdminMutations";

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
