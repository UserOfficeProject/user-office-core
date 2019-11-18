import database from "./database";
import { UserRecord } from "./records";
const BluePromise = require("bluebird");

import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { UserDataSource } from "../UserDataSource";
import { Transaction } from "knex";

export default class PostgresUserDataSource implements UserDataSource {
  private createUserObject(user: UserRecord) {
    return new User(
      user.user_id,
      user.user_title,
      user.firstname,
      user.middlename,
      user.lastname,
      user.username,
      user.preferredname,
      user.orcid,
      user.gender,
      user.nationality,
      user.birthdate,
      user.organisation,
      user.department,
      user.organisation_address,
      user.position,
      user.email,
      user.email_verified,
      user.telephone,
      user.telephone_alt,
      user.created_at.toISOString(),
      user.updated_at.toISOString()
    );
  }

  checkEmailExist(email: string): Promise<Boolean | null> {
    return database
      .select()
      .from("users")
      .where("email", email)
      .first()
      .then((user: any) => (user ? true : false))
      .catch(() => null);
  }

  checkOrcIDExist(orcID: string): Promise<Boolean | null> {
    return database
      .select()
      .from("users")
      .where("orcid", orcID)
      .first()
      .then((user: any) => (user ? true : false))
      .catch(() => null);
  }

  getPasswordByEmail(email: string): Promise<string | null> {
    return database
      .select("password")
      .from("users")
      .where("email", email)
      .first()
      .then((user: any) => user.password);
  }

  getPasswordByUsername(username: string): Promise<string | null> {
    return database
      .select("password")
      .from("users")
      .where("username", username)
      .first()
      .then((user: any) => user.password);
  }

  update(user: User): Promise<User | null> {
    const {
      firstname,
      user_title,
      middlename,
      lastname,
      preferredname,
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
    } = user;
    return database
      .update({
        firstname,
        user_title,
        middlename,
        lastname,
        preferredname,
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
      })
      .from("users")
      .where("user_id", user.id)
      .then(() => {
        return user;
      })
      .catch((e: string) => {
        console.log(e);
        return null;
      });
  }

  async getRoles() {
    return database
      .select()
      .from("roles")
      .then((roles: any[]) =>
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async getUserRoles(id: number): Promise<Role[]> {
    return database
      .select()
      .from("roles as r")
      .join("role_user as rc", { "r.role_id": "rc.role_id" })
      .join("users as u", { "u.user_id": "rc.user_id" })
      .where("u.user_id", id)
      .then((roles: any[]) =>
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async setUserRoles(id: number, roles: number[]): Promise<Boolean | null> {
    return database.transaction(function(trx: Transaction) {
      return database
        .from("role_user")
        .where("user_id", id)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(roles, (role_id: number) => {
            return database
              .insert({ user_id: id, role_id: role_id })
              .into("role_user")
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
          return true;
        })
        .catch(() => {
          trx.rollback;
          return false;
        });
    });
  }

  async setUserPassword(id: number, password: string): Promise<Boolean> {
    return database
      .update({
        password
      })
      .from("users")
      .where("user_id", id)
      .then(() => {
        return true;
      })
      .catch(() => false);
  }

  async get(id: number) {
    return database
      .select()
      .from("users")
      .where("user_id", id)
      .first()
      .then((user: UserRecord) => this.createUserObject(user));
  }

  async getByUsername(username: string) {
    return database
      .select()
      .from("users")
      .where("username", username)
      .first()
      .then((user: UserRecord) => this.createUserObject(user))
      .catch((error: any) => {
        return null;
      });
  }

  async getByEmail(email: string): Promise<User | null> {
    return database
      .select()
      .from("users")
      .where("email", email)
      .first()
      .then((user: UserRecord) => this.createUserObject(user))
      .catch((error: any) => {
        return null;
      });
  }

  async create(
    user_title: string,
    firstname: string,
    middlename: string,
    lastname: string,
    username: string,
    password: string,
    preferredname: string | null,
    orcid: string,
    orcid_refreshtoken: string,
    gender: string,
    nationality: string,
    birthdate: string,
    organisation: string,
    department: string,
    organisation_address: string,
    position: string,
    email: string,
    telephone: string,
    telephone_alt: string | null
  ) {
    return database
      .insert({
        user_title,
        firstname,
        middlename,
        lastname,
        username,
        password,
        preferredname,
        orcid,
        orcid_refreshtoken,
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
      })
      .returning(["*"])
      .into("users")
      .then((user: UserRecord[]) => this.createUserObject(user[0]))
      .then((user: User) => {
        this.setUserRoles(user.id, [1]);
        return user;
      });
  }

  async getUsers(
    filter?: string,
    first?: number,
    offset?: number,
    usersOnly?: boolean,
    subtractUsers?: [number]
  ) {
    return database
      .select(["*", database.raw("count(*) OVER() AS full_count")])
      .from("users")
      .orderBy("user_id", "desc")
      .modify((query: any) => {
        if (filter) {
          query
            .where("organisation", "ilike", `%${filter}%`)
            .orWhere("firstname", "ilike", `%${filter}%`)
            .orWhere("lastname", "ilike", `%${filter}%`);
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
        if (usersOnly) {
          query.whereIn("user_id", function(this: any) {
            this.select("user_id")
              .from("role_user")
              .where("role_id", 1);
          });
        }
        if (subtractUsers) {
          query.whereNotIn("user_id", subtractUsers);
        }
      })
      .then((usersRecord: UserRecord[]) => {
        const users = usersRecord.map(user => this.createUserObject(user));
        return {
          totalCount: usersRecord[0] ? usersRecord[0].full_count : 0,
          users
        };
      });
  }
  async setUserEmailVerified(id: number): Promise<Boolean> {
    return database
      .update({
        email_verified: true
      })
      .from("users")
      .where("user_id", id)
      .then(() => {
        return true;
      })
      .catch(() => false);
  }
  async getProposalUsers(id: number) {
    return database
      .select()
      .from("users as u")
      .join("proposal_user as pc", { "u.user_id": "pc.user_id" })
      .join("proposals as p", { "p.proposal_id": "pc.proposal_id" })
      .where("p.proposal_id", id)
      .then((users: UserRecord[]) =>
        users.map(user => this.createUserObject(user))
      );
  }
}
