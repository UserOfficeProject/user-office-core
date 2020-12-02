import { Role } from '../../models/Role';
import { Roles } from '../../models/Role';
import { BasicUserDetails, User } from '../../models/User';
import { AddUserRoleArgs } from '../../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../../resolvers/mutations/CreateUserByEmailInviteMutation';
import { UserDataSource } from '../UserDataSource';
import UOWSSoapClient from "../../UOWSSoapInterface";
import database from '../postgres/database';
import {
  UserRecord,
  createUserObject,
  RoleRecord,
  ProposalUserRecord,
} from '../postgres/records';

const client = new UOWSSoapClient("https://devapis.facilities.rl.ac.uk/ws/UserOfficeWebService?wsdl");
const token = "abcd"; //process.env.EXTERNAL_AUTH_TOKEN;

type stfcRole = {
  name: String;
}

export interface stfcBasicPersonDetails {
  country: string;
  deptName: string;
  displayName: string;
  email: string;
  establishmentId: string;
  familyName: string;
  firstNameKnownAs: string;
  fullName: string;
  givenName: string;
  initials: string;
  orgName: string;
  title: string;
  userNumber: string;
  workPhone: string;
}

function toEssBasicUserDetails(stfcUser: stfcBasicPersonDetails) {
  return new BasicUserDetails(
    Number(stfcUser.userNumber),
    stfcUser.givenName,
    stfcUser.familyName,
    stfcUser.orgName,
    "",
    new Date(),
    false
  )
}

function toEssUser(stfcUser: stfcBasicPersonDetails) {
  return new User(
    Number(stfcUser.userNumber),
    stfcUser.title,
    stfcUser.givenName,
    undefined,
    stfcUser.familyName,
    stfcUser.email,
    stfcUser.firstNameKnownAs,
    "",
    "",
    "",
    0,
    "",
    0,
    stfcUser.deptName,
    "",
    stfcUser.email,
    true,
    stfcUser.workPhone,
    undefined,
    false,
    "",
    ""
  )
}

export class StfcDataSource implements UserDataSource {

  async delete(id: number): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async addUserRole(args: AddUserRoleArgs): Promise<boolean> {
    const { userID, roleID } = args;

    return database
      .insert({
        user_id: userID,
        role_id: roleID,
      })
      .into('role_user')
      .then(() => {
        return true;
      });
  }
  
  getByOrcID(orcID: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async createInviteUser(args: CreateUserByEmailInviteArgs): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async createOrganisation(name: string, verified: boolean): Promise<number> {
    return database
      .insert({
        institution: name,
        verified,
      })
      .into('institutions')
      .returning('institution_id')
      .then((id: number[]) => id[0]);
  }

  async getProposalUsersFull(proposalId: number): Promise<User[]> {
    // Use single request
    return database
    .select()
    .from('proposal_user as pc')
    .join('proposals as p', { 'p.proposal_id': 'pc.proposal_id' })
    .where('p.proposal_id', proposalId)
    .then((proposalUsers: ProposalUserRecord[]) => proposalUsers.map(
      proposalUser => (toEssUser(client.getBasicPersonDetailsFromUserNumber(token, proposalUser.user_id)))
    ));
  }

  async getBasicUserInfo(
    id: number
  ): Promise<import('../../models/User').BasicUserDetails | null> {
    return toEssBasicUserDetails(await client.getBasicPersonDetailsFromUserNumber(token, id).return);
  }

  async checkOrcIDExist(orcID: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return (await client.getBasicPersonDetailsFromEmail(token, email).return) != null;
  }

  async getPasswordByEmail(email: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  setUserEmailVerified(id: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async setUserPassword(
    id: number,
    password: string
  ): Promise<BasicUserDetails> {
    throw new Error("Method not implemented.");
  }

  async getByEmail(email: string): Promise<User | null> {
    return database
      .select()
      .from('users')
      .where('email', 'ilike', email)
      .first()
      .then((user: UserRecord) => {
        if (!user) {
          return null;
        }

        return createUserObject(user);
      });
  }

  async getByUsername(username: string): Promise<User | null> {
    return toEssUser(await client.getBasicPersonDetailsFromEmail(token, username).return);
  }

  async getPasswordByUsername(username: string): Promise<string | null> {
    throw new Error("Method not implemented.");
  }

  async setUserRoles(id: number, roles: number[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
  async getUserRoles(id: number): Promise<Role[]> {
    let stfcRoles = (await client.getRolesForUser(token, 1059527)).return;
    
    let stfcRolesToEssRoles = new Map<String, Role>([
        ["User Officer", new Role(0, Roles.USER_OFFICER, "User Officer")],
        ["ISIS Instrument Scientist", new Role(0, Roles.INSTRUMENT_SCIENTIST, "Instrument Scientist")],
        ["User", new Role(0, Roles.USER, "User")]
    ]);

    let roles: Role[] = [];

    stfcRoles.forEach((stfcRole: stfcRole) => {
      let essRole: Role | undefined = stfcRolesToEssRoles.get(stfcRole.name);
      if (essRole != null && !roles.includes(essRole)) {
        roles.push(essRole);
      }
    })

    return roles;
  }

  async getRoles(): Promise<Role[]> {
    return database
      .select()
      .from('roles')
      .then((roles: RoleRecord[]) =>
        roles.map(role => new Role(role.role_id, role.short_code, role.title))
      );
  }

  async update(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }

  async me(id: number) {
    return toEssUser(await client.getBasicPersonDetailsFromUserNumber(token, id).return);
  }

  async get(id: number) {
    return toEssUser(await client.getBasicPersonDetailsFromUserNumber(token, id).return);
  }

  async getUsers(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; users: BasicUserDetails[] }> {
    // TODO

    throw new Error("Method not implemented.");
  }

  async getProposalUsers(proposalId: number): Promise<BasicUserDetails[]> {
    // TODO

    throw new Error("Method not implemented.");
  }

  async checkScientistToProposal(
    scientistId: number,
    proposalId: number
  ): Promise<boolean> {
    const proposal = await database
      .select('*')
      .from('proposals as p')
      .join('instrument_has_scientists as ihs', {
        'ihs.user_id': scientistId,
      })
      .join('instrument_has_proposals as ihp', {
        'ihp.instrument_id': 'ihs.instrument_id',
      })
      .where('ihp.proposal_id', proposalId)
      .first();

    return !!proposal;
  }

  async create(
    user_title: string | undefined,
    firstname: string,
    middlename: string | undefined,
    lastname: string,
    username: string,
    password: string,
    preferredname: string | undefined,
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
    telephone_alt: string | undefined
  ): Promise<User> {
    throw new Error("Method not implemented.");
  }

}