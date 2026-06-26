import { Country } from '../models/Country';
import { Institution } from '../models/Institution';
import { Rejection } from '../models/Rejection';
import { BasicUserDetails, User } from '../models/User';

export type UserWithInstitution = {
  user: User;
  institution: Institution;
  country: Country;
};

// TODO: how does this entity relate to the invite flow?
export interface DataAccessUsersDataSource {
  findByProposalPk(proposalPk: number): Promise<BasicUserDetails[]>;

  getDataAccessUsersWithInstitution(
    proposalPk: number
  ): Promise<UserWithInstitution[]>;
  // add / remove users already in the system; invite flow works separately

  // separate function for accepted invites to prevent data races
  // proposalPk and userId both needed for uniqueness
  addDataAccessUser(
    proposalPk: number,
    userId: number
  ): Promise<BasicUserDetails | Rejection>;

  updateDataAccessUsers(
    proposalPk: number,
    userIds: number[]
  ): Promise<BasicUserDetails[] | Rejection>;

  isDataAccessUserOfProposal(id: number, proposalPk: number): Promise<boolean>;
  // invite -> generate unique invite code -> create claim with user roles -> commit to DB; send email -> send success
}
