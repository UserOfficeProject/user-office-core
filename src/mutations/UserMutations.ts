import { User } from "../models/User";
import { UserDataSource } from "../datasources/UserDataSource";
import { rejection, Rejection } from "../rejection";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { UserAuthorization } from "../utils/UserAuthorization";

const jsonwebtoken = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";

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

  async create(
    user_title: string,
    firstname: string,
    middlename: string,
    lastname: string,
    username: string,
    password: string,
    preferredname: string,
    orcid: string,
    orcidHash: string,
    refreshToken: string,
    gender: string,
    nationality: string,
    birthdate: string,
    organisation: string,
    department: string,
    organisation_address: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string
  ): Promise<{ user: User; link: string } | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (firstname === "") {
          return rejection("INVALID_FIRST_NAME");
        }

        if (lastname === "") {
          return rejection("INVALID_LAST_NAME");
        }

        if (this.createHash(orcid) !== orcidHash) {
          return rejection("ORCID_HASH_MISMATCH");
        }

        const hash = this.createHash(password);

        const user = await this.dataSource.create(
          user_title,
          firstname,
          middlename,
          lastname,
          username,
          hash,
          preferredname,
          orcid,
          refreshToken,
          gender,
          nationality,
          birthdate,
          organisation,
          department,
          organisation_address,
          position,
          email,
          telephone,
          telephone_alt
        );
        if (!user) {
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
    id: string,
    firstname?: string,
    lastname?: string,
    roles?: number[]
  ): Promise<User | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, parseInt(id)))
    ) {
      return rejection("WRONG_PERMISSIONS");
    }
    let user = await this.dataSource.get(parseInt(id)); //Hacky

    if (!user) {
      return rejection("INTERNAL_ERROR");
    }

    if (firstname !== undefined) {
      user.firstname = firstname;

      if (firstname.length < 2) {
        return rejection("TOO_SHORT_NAME");
      }
    }

    if (lastname !== undefined) {
      user.lastname = lastname;

      if (lastname.length < 2) {
        return rejection("TOO_SHORT_NAME");
      }
    }

    if (roles !== undefined) {
      if (!(await this.userAuth.isUserOfficer(agent))) {
        return rejection("WRONG_PERMISSIONS");
      }
      const resultUpdateRoles = await this.dataSource.setUserRoles(
        parseInt(id),
        roles
      );
      if (!resultUpdateRoles) {
        return rejection("INTERNAL_ERROR");
      }
    }
    const result = await this.dataSource.update(user);

    return result || rejection("INTERNAL_ERROR");
  }
  async login(username: string, password: string): Promise<string | Rejection> {
    const user = await this.dataSource.getByUsername(username);

    if (!user) {
      return rejection("WRONG_USERNAME_OR_PASSWORD");
    }
    const roles = await this.dataSource.getUserRoles(user.id);
    const result = await this.dataSource.getPasswordByUsername(username);

    if (!result) {
      return rejection("WRONG_USERNAME_OR_PASSWORD");
    }

    const valid = bcrypt.compareSync(password, result);

    if (!valid) {
      return rejection("WRONG_USERNAME_OR_PASSWORD");
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
      return rejection("BAD_TOKEN");
    }
  }

  async resetPasswordEmail(
    email: String
  ): Promise<{ user: User; link: string } | Rejection> {
    return this.eventBus.wrap(
      async () => {
        const user = await this.dataSource.getByEmail(email);

        if (!user) {
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
      return false;
    }
  }

  async resetPassword(token: string, password: string): Promise<Boolean> {
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
        return this.dataSource.setUserPassword(user.id, hash);
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
