import database from "./database";
import { UserRecord } from "./records";
const BluePromise = require("bluebird");

import { User, BasicUserDetails } from "../../models/User";
import { Role } from "../../models/Role";
import { UserDataSource } from "../UserDataSource";

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
      user.orcid_refreshtoken,
      user.gender,
      user.nationality,
      user.birthdate,
      user.organisation,
      user.department,
      user.position,
      user.email,
      user.email_verified,
      user.telephone,
      user.telephone_alt,
      user.placeholder,
      user.created_at.toISOString(),
      user.updated_at.toISOString()
    );
  }

  private createBasicUserObject(user: UserRecord) {
    return new BasicUserDetails(
      user.user_id,
      user.firstname,
      user.lastname,
      user.institution,
      user.position
    );
  }

  checkEmailExist(email: string): Promise<Boolean | null> {
    return database
      .select()
      .from("users")
      .where("email", email)
      .andWhere("placeholder", false)
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
      position,
      email,
      telephone,
      telephone_alt,
      placeholder,
      orcid,
      refreshToken
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
        position,
        email,
        telephone,
        telephone_alt,
        placeholder,
        orcid
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
  async createInviteUser(
    firstname: string,
    lastname: string,
    email: string
  ): Promise<number> {
    return database
      .insert({
        user_title: "",
        firstname,
        middlename: "",
        lastname,
        username: email,
        password: "",
        preferredname: firstname,
        orcid: "",
        orcid_refreshtoken: "",
        gender: "",
        nationality: null,
        birthdate: "1111-11-11",
        organisation: 1,
        department: "",
        position: "",
        email,
        telephone: "",
        telephone_alt: "",
        placeholder: true
      })
      .returning(["user_id"])
      .into("users")
      .then((user: any[]) => user[0].user_id);
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

  getBasicUserInfo(id: number): Promise<BasicUserDetails | null> {
    return database
      .select()
      .from("users as u")
      .join("institutions as i", { "u.organisation": "i.institution_id" })
      .where("user_id", id)
      .first()
      .then((user: UserRecord) => this.createBasicUserObject(user))
      .catch((error: any) => {
        return null;
      });
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

  async getByEmail(email: String): Promise<User | null> {
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
    nationality: number,
    birthdate: string,
    organisation: number,
    department: string,
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
      })
      .catch((error: any) => {
        console.log(error);
        return null;
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
      .join("institutions as i", { organisation: "i.institution_id" })
      .orderBy("user_id", "desc")
      .modify((query: any) => {
        if (filter) {
          query
            .where("institution", "ilike", `%${filter}%`)
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
        const users = usersRecord.map(user => this.createBasicUserObject(user));
        return {
          totalCount: usersRecord[0] ? usersRecord[0].full_count : 0,
          users
        };
      })
      .catch((error: any) => {
        console.log(error);
        return null;
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
  async getProposalUsersFull(proposalId: number): Promise<User[]> {
    return database
      .select()
      .from("users as u")
      .join("proposal_user as pc", { "u.user_id": "pc.user_id" })
      .join("proposals as p", { "p.proposal_id": "pc.proposal_id" })
      .where("p.proposal_id", proposalId)
      .then((users: UserRecord[]) =>
        users.map(user => this.createUserObject(user))
      );
  }
  async getProposalUsers(id: number) {
    return database
      .select()
      .from("users as u")
      .join("institutions as i", { organisation: "i.institution_id" })
      .join("proposal_user as pc", { "u.user_id": "pc.user_id" })
      .join("proposals as p", { "p.proposal_id": "pc.proposal_id" })
      .where("p.proposal_id", id)
      .then((users: UserRecord[]) =>
        users.map(user => this.createBasicUserObject(user))
      );
  }
  async createOrganisation(name: string, verified: boolean): Promise<number> {
    return database
      .insert({
        institution: name,
        verified
      })
      .into("institutions")
      .returning("institution_id")
      .then((id: number[]) => id[0]);
  }
}
