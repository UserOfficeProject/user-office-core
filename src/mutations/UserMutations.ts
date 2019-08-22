import { User } from "../models/User";
import { UserDataSource } from "../datasources/UserDataSource";
import { rejection, Rejection } from "../rejection";
const jsonwebtoken = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";
const config = require("./../../config");

export default class UserMutations {
  constructor(private dataSource: UserDataSource, private userAuth: any) {}

  async create(
    user_title: string,
    firstname: string,
    middlename: string,
    lastname: string,
    username: string,
    password: string,
    preferredname: string,
    orcid: string,
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
      user_title,
      firstname,
      middlename,
      lastname,
      username,
      hash,
      preferredname,
      orcid,
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
    return result || rejection("INTERNAL_ERROR");
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
  async login(
    username: string,
    password: string
  ): Promise<{ token: string } | Rejection> {
    const user = await this.dataSource.getByUsername(username);

    if (!user) {
      return rejection("INTERNAL_ERROR");
    }
    const roles = await this.dataSource.getUserRoles(user.id);
    const result = await this.dataSource.getPasswordByUsername(username);

    if (!result) {
      return rejection("INTERNAL_ERROR");
    }

    const valid = bcrypt.compareSync(password, result);

    if (!valid) {
      return rejection("WRONG_PASSWORD");
    }
    const token = jsonwebtoken.sign({ user, roles }, config.secret, {
      expiresIn: config.tokenLife
    });

    return token;
  }

  async token(token: string): Promise<{ token: string } | Rejection> {
    try {
      const decoded = jsonwebtoken.verify(token, config.secret);
      const freshToken = jsonwebtoken.sign(
        { user: decoded.user, roles: decoded.roles },
        config.secret,
        {
          expiresIn: config.tokenLife
        }
      );
      return freshToken;
    } catch (error) {
      return rejection("BAD_TOKEN");
    }
  }
}
