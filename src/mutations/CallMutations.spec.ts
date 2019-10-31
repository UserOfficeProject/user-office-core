import CallMutations from "./CallMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import { ApplicationEvent } from "../events/applicationEvents";
import {
  callDataSource,
  dummyCall
} from "../datasources/mockups/CallDataSource";
import {
  userDataSource,
  dummyUser,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const callMutations = new CallMutations(
  new callDataSource(),
  userAuthorization,
  dummyEventBus
);

test("A user can not create a call", () => {
  return expect(
    callMutations.create(
      dummyUser,
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "Comment review",
      "Comment feedback"
    )
  ).resolves.toHaveProperty("reason", "NOT_USER_OFFICER");
});

test("A not logged in user can not create a call", () => {
  return expect(
    callMutations.create(
      null,
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "Comment review",
      "Comment feedback"
    )
  ).resolves.toHaveProperty("reason", "NOT_LOGGED_IN");
});

test("A not logged in user can not create a call", () => {
  return expect(
    callMutations.create(
      dummyUserOfficer,
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "2019-02-19",
      "Comment review",
      "Comment feedback"
    )
  ).resolves.toBe(dummyCall);
});
