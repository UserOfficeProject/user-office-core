import { read } from 'fs';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';

@injectable()
export class UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) private sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource) private proposalDataSource: ProposalDataSource,
  ) {}

  isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  isUser(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then((roles) => {
      return roles.some((roleItem) => roleItem.shortCode === role);
    });
  }

  isInstrumentScientist(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.INSTRUMENT_SCIENTIST;
  }

  async isChairOrSecretaryOfSEP(
    agent: User | null,
    sepId: number
  ): Promise<boolean> {
    if (agent == null || !agent.id || !sepId) {
      return false;
    }

    return this.sepDataSource.isChairOrSecretaryOfSEP(agent.id, sepId);
  }

  hasGetAccessByToken(agent: UserWithRole) {
    return !!agent.accessPermissions?.['ProposalQueries.get'];
  }

  async isMemberOfSEP(
    agent: UserWithRole | null,
    sepId: number
  ): Promise<boolean> {
    if (agent == null || !agent.currentRole) {
      return false;
    }

    const [sep] = await this.sepDataSource.getUserSepsByRoleAndSepId(
      agent.id,
      agent.currentRole,
      sepId
    );

    return sep !== null;
  }

  async isExternalTokenValid(externalToken: string): Promise<boolean> {
    return await this.userDataSource.isExternalTokenValid(externalToken);
  }

  async listReadableUsers(
    agent: UserWithRole | null,
    ids: number[]
  ): Promise<number[]> {
    if (agent === null) {
      return [];
    }

    const isUserOfficer = this.isUserOfficer(agent);
    const isInstrumentScientist = this.isInstrumentScientist(agent);

    if (isUserOfficer || isInstrumentScientist) {
      return ids;
    }

    const self = [];

    if (ids.includes(agent.id)) {
      self.push(agent.id);
    }

    const relatedProposalUsers =
      await this.proposalDataSource.getRelatedUsersOnProposals(agent.id);

    const availableUsers = [
      ...self,
      ...ids.filter((id) => relatedProposalUsers.includes(id)),
    ];

    return availableUsers;
  }

  async canReadUser(agent: UserWithRole | null, id: number): Promise<boolean> {
    const readableUsers = await this.listReadableUsers(agent, [id]);

    return readableUsers.includes(id);
  }
}
