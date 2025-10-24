import { Country } from '../models/Country';
import { Institution } from '../models/Institution';
import { Rejection } from '../models/Rejection';
import { BasicUserDetails, User } from '../models/User';

export type UserWithInstitution = {
  user: User;
  institution: Institution | null;
  country: Country | null;
};

export interface DataAccessUsersDataSource {
  findByProposalPk(proposalPk: number): Promise<BasicUserDetails[]>;
  getDataAccessUsersWithInstitution(
    proposalPk: number
  ): Promise<UserWithInstitution[]>;
  updateDataAccessUsers(
    proposalPk: number,
    userIds: number[]
  ): Promise<BasicUserDetails[] | Rejection>;
  isDataAccessUserOfProposal(id: number, proposalPk: number): Promise<boolean>;
}
