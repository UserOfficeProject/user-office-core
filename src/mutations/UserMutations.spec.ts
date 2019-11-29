import UserMutations from "./UserMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import { ApplicationEvent } from "../events/applicationEvents";
import {
  userDataSource,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
  dummyPlaceHolderUser
} from "../datasources/mockups/UserDataSource";

const jsonwebtoken = require("jsonwebtoken");

const goodToken = jsonwebtoken.sign(
  {
    id: dummyUser.id,
    type: "passwordReset",
    updated: dummyUser.updated
  },
  process.env.secret,
  { expiresIn: "24h" }
);

const badToken = jsonwebtoken.sign(
  {
    id: dummyUser.id,
    updated: dummyUser.updated
  },
  process.env.secret,
  { expiresIn: "-24h" }
);

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const userMutations = new UserMutations(
  new userDataSource(),
  userAuthorization,
  dummyEventBus
);

test("A user can invite another user by email", () => {
  return expect(
    userMutations.createUserByEmailInvite(
      dummyUser,
      "firstname",
      "lastname",
      "email@google.com"
    )
  ).resolves.toStrictEqual({ inviterId: dummyUser.id, userId: 5 });
});

test("A user must be logged in to invite another user by email", () => {
  return expect(
    userMutations.createUserByEmailInvite(
      null,
      "firstname",
      "lastname",
      "email@google.com"
    )
  ).resolves.toHaveProperty("reason", "MUST_LOGIN");
});

test("A user cannot invite another user by email if the user already has an account", () => {
  return expect(
    userMutations.createUserByEmailInvite(
      dummyUserNotOnProposal,
      "firstname",
      "lastname",
      dummyUser.email
    )
  ).resolves.toHaveProperty("reason", "ACCOUNT_EXIST");
});

test("A user can reinvite another user by email if the user has not created an account", () => {
  return expect(
    userMutations.createUserByEmailInvite(
      dummyUser,
      "firstname",
      "lastname",
      dummyPlaceHolderUser.email
    )
  ).resolves.toStrictEqual({
    inviterId: dummyUser.id,
    userId: dummyPlaceHolderUser.id
  });
});

test("A user can update it's own name", () => {
  return expect(
    userMutations.update(dummyUser, {
      id: 2,
      firstname: "klara",
      lastname: "undefined"
    })
  ).resolves.toBe(dummyUser);
});

test("A user cannot update another users name", () => {
  return expect(
    userMutations.update(dummyUserNotOnProposal, {
      id: 2,
      firstname: "klara",
      lastname: "undefined"
    })
  ).resolves.toHaveProperty("reason", "WRONG_PERMISSIONS");
});

test("A not logged in user cannot update another users name", () => {
  return expect(
    userMutations.update(null, {
      id: 2,
      firstname: "klara",
      lastname: "undefined"
    })
  ).resolves.toHaveProperty("reason", "WRONG_PERMISSIONS");
});

test("A userofficer can update another users name", () => {
  return expect(
    userMutations.update(dummyUserOfficer, {
      id: 2,
      firstname: "klara",
      lastname: "undefined"
    })
  ).resolves.toBe(dummyUser);
});

test("A user cannot update it's roles", () => {
  return expect(
    userMutations.update(dummyUser, {
      id: 2,
      firstname: "klara",
      lastname: "undefined",
      roles: [1, 2]
    })
  ).resolves.toHaveProperty("reason", "WRONG_PERMISSIONS");
});

test("A userofficer can update users roles", () => {
  return expect(
    userMutations.update(dummyUserOfficer, {
      id: 2,
      firstname: "klara",
      lastname: "undefined",
      roles: [1, 2]
    })
  ).resolves.toBe(dummyUser);
});

test("A user should be able to login with credentials and get a token", () => {
  return expect(
    userMutations.login(dummyUser.email, "Test1234!").then(data => typeof data)
  ).resolves.toBe("string");
});

test("A user should not be able to login with unvalid credentials", () => {
  return expect(
    userMutations.login(dummyUser.username, "Wrong_Password!")
  ).resolves.toHaveProperty("reason", "WRONG_EMAIL_OR_PASSWORD");
});

test("A user should not be able to update a token if it is unvalid", () => {
  return expect(
    userMutations.token("this_is_a_invalid_token")
  ).resolves.toHaveProperty("reason", "BAD_TOKEN");
});

test("A user should not be able to update a token if it is expired", () => {
  return expect(userMutations.token(badToken)).resolves.toHaveProperty(
    "reason",
    "BAD_TOKEN"
  );
});

test("A user should be able to update a token if valid", () => {
  return expect(
    userMutations.token(goodToken).then(data => typeof data)
  ).resolves.toBe("string");
});

test("A user can reset it's password by providing a valid email", () => {
  return expect(
    userMutations.resetPasswordEmail(dummyUser.email)
  ).resolves.toHaveProperty("user");
});

test("A user get's a error if providing a email not attached to a account", () => {
  return expect(
    userMutations.resetPasswordEmail("dummyemail@ess.se")
  ).resolves.toHaveProperty("reason", "COULD_NOT_FIND_USER_BY_EMAIL");
});

test("A user can update it's password if it has a valid token", () => {
  return expect(
    userMutations.resetPassword(goodToken, "Test1234!")
  ).resolves.toBe(true);
});

test("A user can not update it's password if it has a bad token", () => {
  return expect(
    userMutations.resetPassword(badToken, "Test1234!")
  ).resolves.toBe(false);
});

test("A user can it's password ", () => {
  return expect(
    userMutations.updatePassword(dummyUser, dummyUser.id, "Test1234!")
  ).resolves.toBe(true);
});

test("A user can not update another users password ", () => {
  return expect(
    userMutations.updatePassword(
      dummyUserNotOnProposal,
      dummyUser.id,
      "Test1234!"
    )
  ).resolves.toBe(false);
});

test("A not logged in users can not update passwords ", () => {
  return expect(
    userMutations.updatePassword(null, dummyUser.id, "Test1234!")
  ).resolves.toBe(false);
});

test("A user officer can update any password ", () => {
  return expect(
    userMutations.updatePassword(dummyUserOfficer, dummyUser.id, "Test1234!")
  ).resolves.toBe(true);
});
