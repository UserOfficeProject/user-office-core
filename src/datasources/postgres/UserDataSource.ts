import database from "./database";

import User from "../../models/User";
import UserDataSource from "../UserDataSource";

export default class PostgresUserDataSource implements UserDataSource {
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
