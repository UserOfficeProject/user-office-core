import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';

@injectable()
export class UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) private sepDataSource: SEPDataSource
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

  isInstrumentScientist(agent: UserWithRole) {
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
}
