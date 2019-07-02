import User from "../models/User";
import { UserDataSource } from "../datasources/UserDataSource";
import { rejection, Rejection } from "../rejection";
import { isUserOfficer } from "../utils/userAuthorization";
const jsonwebtoken = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";

export default class UserMutations {
  constructor(private dataSource: UserDataSource) {}

  async create(
    firstname: string,
    lastname: string,
    username: string,
    password: string
  ): Promise<User | Rejection> {
    if (firstname === "") {
      return rejection("INVALID_FIRST_NAME");
    }

    if (lastname === "") {
      return rejection("INVALID_LAST_NAME");
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const result = await this.dataSource.create(
      firstname,
      lastname,
      username,
      hash
    );
    return result || rejection("INTERNAL_ERROR");
  }

  async update(
    agent: User | null,
    id: string,
    firstname: string,
    lastname: string,
    roles: number[]
  ): Promise<User | Rejection> {
    // Get user information
    let user = await this.dataSource.get(parseInt(id)); //Hacky
    console.log(user);
    // Check that proposal exist
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

  async addRole(
    agent: User | null,
    userID: number,
    roleID: number
  ): Promise<Boolean | Rejection> {
    const result = await this.dataSource.addUserRole(userID, roleID);

    return result || rejection("INTERNAL_ERROR");
  }

  async login(
    username: string,
    password: string
  ): Promise<{ token: string; user: User } | Rejection> {
    const result = await this.dataSource.getPasswordByUsername(username);

    const valid = bcrypt.compareSync(password, result);

    if (!valid) {
      return rejection("WRONG_PASSWORD");
    }

    const user = await this.dataSource.getByUsername(username);

    if (!user) {
      return rejection("INTERNAL_ERROR");
    }

    return {
      token: jsonwebtoken.sign(
        {
          id: user.id
        },
        "somesuperdupersecret",
        { expiresIn: "1y" }
      ),
      user
    };
  }
}
