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
    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  isUser(agent: UserWithRole | null) {
    return agent?.currentRole?.shortCode === Roles.USER;
  }

  isApiToken(agent: UserWithRole | null) {
    return agent?.isApiAccessToken;
  }

  async hasRole(agent: UserWithRole | null, role: Roles): Promise<boolean> {
    if (!agent) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then((roles) => {
      return roles.some((roleItem) => roleItem.shortCode === role);
    });
  }

  isInstrumentScientist(agent: UserWithRole | null) {
    return agent?.currentRole?.shortCode === Roles.INSTRUMENT_SCIENTIST;
  }

  async isChairOrSecretaryOfSEP(
    agent: UserWithRole | null,
    sepId: number
  ): Promise<boolean> {
    if (!agent || !agent.id || !sepId) {
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
    sepId?: number
  ): Promise<boolean> {
    if (!agent || !agent.currentRole) {
      return false;
    }

    return this.sepDataSource
      .getUserSepsByRoleAndSepId(agent.id, agent.currentRole, sepId)
      .then((userSeps) => userSeps.length > 0);
  }

  async listReadableUsers(
    agent: UserWithRole | null,
    ids: number[]
  ): Promise<number[]> {
    if (!agent) {
      return [];
    }

    const isUserOfficer = this.isUserOfficer(agent);
    const isInstrumentScientist = this.isInstrumentScientist(agent);
    const isSEPMember = await this.isMemberOfSEP(agent);
    const isApiAccessToken = this.isApiToken(agent);
    if (
      isUserOfficer ||
      isInstrumentScientist ||
      isSEPMember ||
      isApiAccessToken
    ) {
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
