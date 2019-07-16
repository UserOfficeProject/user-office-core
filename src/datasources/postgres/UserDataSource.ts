import database from "./database";
import { UserRecord } from "./records";
const BluePromise = require("bluebird");

import { User } from "../../models/User";
import { Role } from "../../models/Role";
import { UserDataSource } from "../UserDataSource";

export default class PostgresUserDataSource implements UserDataSource {
  getPasswordByUsername(username: string): Promise<string | null> {
    return database
      .select("password")
      .from("users")
      .where("username", username)
      .first()
      .then((user: any) => user.password);
  }

  update(user: User): Promise<User | null> {
    return database
      .update({
        firstname: user.firstname,
        lastname: user.lastname
      })
      .from("users")
      .where("user_id", user.id)
      .then(() => {
        return user;
      });
  }
  addUserRole(userID: number, roleID: number): Promise<Boolean | null> {
    return database
      .insert({
        role_id: roleID,
        user_id: userID
      })
      .into("role_user")
      .then(() => {
        return true;
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
    return database.transaction(function(trx: { commit: any; rollback: any }) {
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

  async get(id: number) {
    return database
      .select()
      .from("users")
      .where("user_id", id)
      .first()
      .then(
        (user: UserRecord) =>
          new User(user.user_id, user.firstname, user.lastname, user.username)
      );
  }

  async getByUsername(username: string) {
    return database
      .select()
      .from("users")
      .where("username", username)
      .first()
      .then(
        (user: UserRecord) =>
          new User(user.user_id, user.firstname, user.lastname, user.username)
      );
  }

  async create(
    firstname: string,
    lastname: string,
    username: string,
    password: string
  ) {
    return database
      .insert({
        firstname,
        lastname,
        username,
        password
      })
      .returning("user_id")
      .into("users")
      .then(
        (user_id: number[]) =>
          new User(user_id[0], firstname, lastname, username)
      )
      .then((user: User) => {
        this.setUserRoles(user.id, [1]);
        return user;
      });
  }

  async getUsers(filter: string) {
    return database
      .select()
      .from("users")
      .modify((query: any) => {
        if (filter) {
          query
            .where("username", "ilike", `%${filter}%`)
            .orWhere("firstname", "ilike", `%${filter}%`)
            .orWhere("lastname", "ilike", `%${filter}%`);
        }
      })
      .then((users: UserRecord[]) =>
        users.map(
          user =>
            new User(user.user_id, user.firstname, user.lastname, user.username)
        )
      );
  }

  async getProposalUsers(id: number) {
    return database
      .select()
      .from("users as u")
      .join("proposal_user as pc", { "u.user_id": "pc.user_id" })
      .join("proposals as p", { "p.proposal_id": "pc.proposal_id" })
      .where("p.proposal_id", id)
      .then((users: UserRecord[]) =>
        users.map(
          user =>
            new User(user.user_id, user.firstname, user.lastname, user.username)
        )
      );
  }
}
