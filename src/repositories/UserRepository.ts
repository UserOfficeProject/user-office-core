import User from "../models/User";
import database from "../database";

export default class UserRepository {
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

  async getUsers() {
    return database
      .select()
      .from("users")
      .then((users: Array<any>) =>
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
      .then((users: Array<any>) =>
        users.map(user => new User(user.user_id, user.firstname, user.lastname))
      );
  }
}
