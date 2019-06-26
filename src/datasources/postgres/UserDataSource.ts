import database from "./database";

import User from "../../models/User";
import Role from "../../models/Role";
import { UserDataSource } from "../UserDataSource";

export default class PostgresUserDataSource implements UserDataSource {
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
  addUserRole(userID: number, roleID: number): boolean {
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

  async get(id: number) {
    return database
      .select()
      .from("users")
      .where("user_id", id)
      .first()
      .then(
        (user: { user_id: number; firstname: string; lastname: string }) =>
          new User(user.user_id, user.firstname, user.lastname)
      );
  }

  async create(firstname: string, lastname: string) {
    return database
      .insert({
        firstname: firstname,
        lastname: lastname
      })
      .returning("user_id")
      .into("users")
      .then((user_id: number[]) => new User(user_id[0], firstname, lastname));
  }

  async getUsers() {
    return database
      .select()
      .from("users")
      .then((users: any[]) =>
        users.map(user => new User(user.user_id, user.firstname, user.lastname))
      );
  }

  async getProposalUsers(id: number) {
    return database
      .select()
      .from("users as u")
      .join("proposal_user as pc", { "u.user_id": "pc.user_id" })
      .join("proposals as p", { "p.proposal_id": "pc.proposal_id" })
      .where("p.proposal_id", id)
      .then((users: any[]) =>
        users.map(user => new User(user.user_id, user.firstname, user.lastname))
      );
  }
}
