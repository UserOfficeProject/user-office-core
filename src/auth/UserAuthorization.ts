import 'reflect-metadata';
import { inject } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';

export abstract class UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) protected userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) protected sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    protected proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource) protected visitDataSource: VisitDataSource
  ) {}

  isUserOfficer(agent: UserWithRole | null) {
    if (agent === null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  isUser(agent: UserWithRole | null) {
    if (agent === null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER;
  }

  isApiToken(agent: UserWithRole | null) {
    if (agent === null) {
      return false;
    }

    return agent?.isApiAccessToken;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
    if (agent === null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then((roles) => {
      return roles.some((roleItem) => roleItem.shortCode === role);
    });
  }

  isInstrumentScientist(agent: UserWithRole | null) {
    if (agent === null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.INSTRUMENT_SCIENTIST;
  }

  async isChairOrSecretaryOfSEP(
    agent: UserWithRole | null,
    sepId: number
  ): Promise<boolean> {
    if (agent === null || !agent.id || !sepId) {
      return false;
    }

    const hasChairOrSecretaryAsCurrentRole =
      agent.currentRole?.shortCode === Roles.SEP_CHAIR ||
      agent.currentRole?.shortCode === Roles.SEP_SECRETARY;

    return (
      hasChairOrSecretaryAsCurrentRole &&
      this.sepDataSource.isChairOrSecretaryOfSEP(agent.id, sepId)
    );
  }

  hasGetAccessByToken(agent: UserWithRole) {
    return !!agent.accessPermissions?.['ProposalQueries.get'];
  }

  async isMemberOfSEP(
    agent: UserWithRole | null,
    sepId: number
  ): Promise<boolean> {
    if (agent === null || !agent.currentRole) {
      return false;
    }

    const [sep] = await this.sepDataSource.getUserSepsByRoleAndSepId(
      agent.id,
      agent.currentRole,
      sepId
    );

    return sep !== null;
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
    const isSEPMember = this.isMemberOfSEP(agent, agent.id);
    if (isUserOfficer || isInstrumentScientist || isSEPMember) {
      return ids;
    }

    const self = [];
    if (ids.includes(agent.id)) {
      self.push(agent.id);
    }

    const relatedProposalUsers =
      await this.proposalDataSource.getRelatedUsersOnProposals(agent.id);

    const relatedVisitorUsers =
      await this.visitDataSource.getRelatedUsersOnVisits(agent.id);

    const relatedSepUsers = await this.sepDataSource.getRelatedUsersOnSep(
      agent.id
    );

    const availableUsers = [
      ...self,
      ...ids.filter((id) => relatedProposalUsers.includes(id)),
      ...ids.filter((id) => relatedVisitorUsers.includes(id)),
      ...ids.filter((id) => relatedSepUsers.includes(id)),
    ];

    return availableUsers;
  }

  async canReadUser(agent: UserWithRole | null, id: number): Promise<boolean> {
    const readableUsers = await this.listReadableUsers(agent, [id]);

    return readableUsers.includes(id);
  }

  abstract externalTokenLogin(token: string): Promise<User | null>;

  abstract logout(token: string): Promise<void>;

  abstract isExternalTokenValid(externalToken: string): Promise<boolean>;
}
