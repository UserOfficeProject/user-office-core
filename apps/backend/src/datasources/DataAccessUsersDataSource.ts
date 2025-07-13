import { Rejection } from '../models/Rejection';
import { BasicUserDetails } from '../models/User';

export interface DataAccessUsersDataSource {
  findByProposalPk(proposalPk: number): Promise<BasicUserDetails[]>;
  updateDataAccessUsers(
    proposalPk: number,
    userIds: number[]
  ): Promise<BasicUserDetails[] | Rejection>;
}
