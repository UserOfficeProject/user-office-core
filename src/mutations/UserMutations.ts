import {
  User,
  UpdateUserArgs,
  checkUserArgs,
  BasicUserDetails,
  CreateUserArgs
} from "../models/User";
import { UserDataSource } from "../datasources/UserDataSource";
import { isRejection, rejection, Rejection } from "../rejection";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { UserAuthorization } from "../utils/UserAuthorization";

const jsonwebtoken = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";
import { to } from "await-to-js";
import { logger } from "../utils/Logger";

export default class UserMutations {
  constructor(
    private dataSource: UserDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  createHash(password: string): string {
    //Check that password follows rules

    //Setting fixed salt for development
    //const salt = bcrypt.genSaltSync(10);
    const salt = "$2a$10$1svMW3/FwE5G1BpE7/CPW.";
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  async createUserByEmailInvite(
    agent: User | null,
    firstname: string,
    lastname: string,
    email: string
  ): Promise<{ userId: number; inviterId: number } | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (!agent) {
          return rejection("MUST_LOGIN");
        }
        //Check if email exist in database and if user has been invited before
        const user = await this.dataSource.getByEmail(email);
        if (user && user.placeholder) {
          return {
            userId: user.id,
            inviterId: agent.id
          };
        } else if (user) {
          return rejection("ACCOUNT_EXIST");
        }
        return {
          userId: await this.dataSource.createInviteUser(
            firstname,
            lastname,
            email
          ),
          inviterId: agent.id
        };
      },
      res => {
        return {
          type: "EMAIL_INVITE",
          userId: res.userId,
          inviterId: res.inviterId
        };
      }
    );
  }

  async create(
    args: CreateUserArgs
  ): Promise<{ user: User; link: string } | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (
          this.createHash(args.orcid) !== args.orcidHash &&
          !(process.env.NODE_ENV === "development")
        ) {
          logger.logError("ORCID hash mismatch", { args });
          return rejection("ORCID_HASH_MISMATCH");
        }

        const hash = this.createHash(args.password);
        let organisationId = args.organisation;
        // Check if user has other org and if so create it
        if (args.otherOrganisation) {
          organisationId = await this.dataSource.createOrganisation(
            args.otherOrganisation,
            false
          );
        }

        //Check if email exist in database and if user has been invited
        let user = await this.dataSource.getByEmail(args.email);

        if (user && user.placeholder) {
          const changePassword = await this.updatePassword(
            user,
            user.id,
            args.password
          );
          const updatedUser = await this.update(user, {
            id: user.id,
            placeholder: false,
            password: hash,
            ...args
          });

          if (isRejection(updatedUser) || !changePassword) {
            logger.logError("Could not create user", {
              updatedUser,
              changePassword
            });
            return rejection("INTERNAL_ERROR");
          }
          user = updatedUser;
        } else {
          user = await this.dataSource.create(
            args.user_title,
            args.firstname,
            args.middlename,
            args.lastname,
            `${args.firstname}.${args.lastname}.${args.orcid}`, // This is just for now, while we decide on the final format
            hash,
            args.preferredname,
            args.orcid,
            args.refreshToken,
            args.gender,
            args.nationality,
            args.birthdate,
            organisationId,
            args.department,
            args.position,
            args.email,
            args.telephone,
            args.telephone_alt
          );
        }

        const [updateRolesErr] = await to(
          this.dataSource.setUserRoles(user.id, [1])
        );

        if (!user || updateRolesErr) {
          logger.logError("Could not create user", { args });
          return rejection("INTERNAL_ERROR");
        }

        const token = jsonwebtoken.sign(
          {
            id: user.id,
            type: "emailVerification",
            updated: user.updated
          },
          process.env.secret,
          { expiresIn: "24h" }
        );

        // Email verification link
        const link = process.env.baseURL + "/emailVerification/" + token;

        return { user, link };
      },
      res => {
        return { type: "ACCOUNT_CREATED", user: res.user, link: res.link };
      }
    );
  }

  async update(
    agent: User | null,
    args: UpdateUserArgs
  ): Promise<User | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, args.id))
    ) {
      return rejection("WRONG_PERMISSIONS");
    }

    const checkArgs = checkUserArgs(args);
    if (isRejection(checkArgs)) {
      return checkArgs;
    }

    let user = await this.dataSource.get(args.id); //Hacky

    if (!user) {
      return rejection("INTERNAL_ERROR");
    }
    user = {
      ...user,
      ...args,
      roles: user.roles,
      reviews: user.reviews,
      proposals: user.proposals
    };

    if (args.roles !== undefined) {
      if (!(await this.userAuth.isUserOfficer(agent))) {
        return rejection("WRONG_PERMISSIONS");
      }
      const [err] = await to(this.dataSource.setUserRoles(args.id, args.roles));
      if (err) {
        logger.logError("Could not set user roles", { err });
        return rejection("INTERNAL_ERROR");
      }
    }
    return this.dataSource
      .update(user)
      .then(user => user)
      .catch(err => {
        logger.logException("Could not create user", err, { user });
        return rejection("INTERNAL_ERROR");
      });
  }

  async login(email: string, password: string): Promise<string | Rejection> {
    const user = await this.dataSource.getByEmail(email);

    if (!user) {
      return rejection("WRONG_EMAIL_OR_PASSWORD");
    }
    const roles = await this.dataSource.getUserRoles(user.id);
    const result = await this.dataSource.getPasswordByEmail(email);

    if (!result) {
      return rejection("WRONG_EMAIL_OR_PASSWORD");
    }

    const valid = bcrypt.compareSync(password, result);

    if (!valid) {
      return rejection("WRONG_EMAIL_OR_PASSWORD");
    }

    if (!user.emailVerified) {
      return rejection("EMAIL_NOT_VERIFIED");
    }
    const token = jsonwebtoken.sign({ user, roles }, process.env.secret, {
      expiresIn: process.env.tokenLife
    });

    return token;
  }

  async token(token: string): Promise<{ token: string } | Rejection> {
    try {
      const decoded = jsonwebtoken.verify(token, process.env.secret);
      const freshToken = jsonwebtoken.sign(
        { user: decoded.user, roles: decoded.roles },
        process.env.secret,
        {
          expiresIn: process.env.tokenLife
        }
      );
      return freshToken;
    } catch (error) {
      logger.logError("Bad token", { token });
      return rejection("BAD_TOKEN");
    }
  }

  async resetPasswordEmail(
    email: string
  ): Promise<{ user: User; link: string } | Rejection> {
    return this.eventBus.wrap(
      async () => {
        const user = await this.dataSource.getByEmail(email);

        if (!user) {
          logger.logInfo("Could not find user by email", { email });
          return rejection("COULD_NOT_FIND_USER_BY_EMAIL");
        }

        const token = jsonwebtoken.sign(
          {
            id: user.id,
            type: "passwordReset",
            updated: user.updated
          },
          process.env.secret,
          { expiresIn: "24h" }
        );

        const link = process.env.baseURL + "/resetPassword/" + token;

        // Send reset email with link
        return { user, link };
      },
      res => {
        return { type: "PASSWORD_RESET_EMAIL", user: res.user, link: res.link };
      }
    );
  }

  async emailVerification(token: string) {
    // Check that token is valid
    try {
      const decoded = jsonwebtoken.verify(token, process.env.secret);
      const user = await this.dataSource.get(decoded.id);
      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === "emailVerification"
      ) {
        return this.dataSource.setUserEmailVerified(user.id);
      } else {
        return false;
      }
    } catch (error) {
      logger.logException("Could not verify email", error, { token });
      return false;
    }
  }
  async updatePassword(agent: User | null, id: number, password: string) {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, id))
    ) {
      return false;
    }
    try {
      const hash = this.createHash(password);
      let user = await this.dataSource.get(id);
      if (user) {
        return this.dataSource.setUserPassword(user.id, hash);
      } else {
        logger.logError("Could not update password. Used does not exist", {
          agent,
          id
        });
        return false;
      }
    } catch (error) {
      logger.logException("Could not update password", error, { agent, id });
      return false;
    }
  }
  async resetPassword(
    token: string,
    password: string
  ): Promise<BasicUserDetails | Rejection> {
    // Check that token is valid
    try {
      const hash = this.createHash(password);
      const decoded = jsonwebtoken.verify(token, process.env.secret);
      const user = await this.dataSource.get(decoded.id);

      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === "passwordReset"
      ) {
        return this.dataSource
          .setUserPassword(user.id, hash)
          .then(user => user)
          .catch(err => {
            logger.logError("Could not reset password", { err });
            return rejection("INTERNAL_ERROR");
          });
      }
      logger.logError("Could not reset password incomplete data", {
        user,
        decoded
      });
      return rejection("INTERNAL_ERROR");
    } catch (error) {
      logger.logError("Could not reset password", { error, token });
      return rejection("INTERNAL_ERROR");
    }
  }
}
