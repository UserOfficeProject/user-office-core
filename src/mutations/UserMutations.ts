import { User } from "../models/User";
import { UserDataSource } from "../datasources/UserDataSource";
import { rejection, Rejection } from "../rejection";
const jsonwebtoken = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";

export default class UserMutations {
  constructor(private dataSource: UserDataSource, private userAuth: any) {}

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

    //Setting fixed salt for development
    //const salt = bcrypt.genSaltSync(10);
    const salt = "$2a$10$1svMW3/FwE5G1BpE7/CPW.";
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
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, id))
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
    if (await this.userAuth.isUserOfficer(agent)) {
      const result = await this.dataSource.addUserRole(userID, roleID);

      return result || rejection("INTERNAL_ERROR");
    } else {
      return rejection("WRONG_PERMISSIONS");
    }
  }

  async login(
    username: string,
    password: string
  ): Promise<{ token: string; user: User } | Rejection> {
    const user = await this.dataSource.getByUsername(username);

    if (!user) {
      return rejection("INTERNAL_ERROR");
    }

    const result = await this.dataSource.getPasswordByUsername(username);

    if (!result) {
      return rejection("INTERNAL_ERROR");
    }

    const valid = bcrypt.compareSync(password, result);

    if (!valid) {
      return rejection("WRONG_PASSWORD");
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
