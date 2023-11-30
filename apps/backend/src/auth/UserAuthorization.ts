import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { InternalReviewDataSource } from '../datasources/InternalReviewDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { AuthJwtPayload, User, UserWithRole } from '../models/User';
import { AdminDataSource } from './../datasources/AdminDataSource';

export abstract class UserAuthorization {
  protected userDataSource: UserDataSource = container.resolve(
    Tokens.UserDataSource
  );
  protected fapDataSource: FapDataSource = container.resolve(
    Tokens.FapDataSource
  );
  protected proposalDataSource: ProposalDataSource = container.resolve(
    Tokens.ProposalDataSource
  );
  protected internalReviewDataSource: InternalReviewDataSource =
    container.resolve(Tokens.InternalReviewDataSource);
  protected visitDataSource: VisitDataSource = container.resolve(
    Tokens.VisitDataSource
  );

  protected adminDataSource: AdminDataSource = container.resolve(
    Tokens.AdminDataSource
  );

  isUserOfficer(agent: UserWithRole | null) {
    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  async isInternalUser(
    userId: number,
    currentRole: Role | null
  ): Promise<boolean> {
    return false;
  }
  isUser(agent: UserWithRole | null) {
    return agent?.currentRole?.shortCode === Roles.USER;
  }

  isApiToken(agent: UserWithRole | null) {
    return agent?.isApiAccessToken;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
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

  async isChairOrSecretaryOfFap(
    agent: UserWithRole | null,
    fapId: number
  ): Promise<boolean> {
    if (!agent || !agent.id || !fapId) {
      return false;
    }

    const hasChairOrSecretaryAsCurrentRole =
      agent.currentRole?.shortCode === Roles.FAP_CHAIR ||
      agent.currentRole?.shortCode === Roles.FAP_SECRETARY;

    return (
      hasChairOrSecretaryAsCurrentRole &&
      this.fapDataSource.isChairOrSecretaryOfFap(agent.id, fapId)
    );
  }

  async isInternalReviewerOnTechnicalReview(
    agent: UserWithRole | null,
    technicalReviewId?: number
  ): Promise<boolean> {
    if (!agent || !agent.id || !technicalReviewId) {
      return false;
    }

    return this.internalReviewDataSource.isInternalReviewerOnTechnicalReview(
      agent.id,
      technicalReviewId
    );
  }

  async isInternalReviewer(agent: UserWithRole | null): Promise<boolean> {
    if (!agent || !agent.id) {
      return false;
    }

    return this.internalReviewDataSource.isInternalReviewer(agent.id);
  }

  hasGetAccessByToken(agent: UserWithRole) {
    return !!agent.accessPermissions?.['ProposalQueries.get'];
  }

  async isMemberOfFap(
    agent: UserWithRole | null,
    fapId?: number
  ): Promise<boolean> {
    if (!agent || !agent.currentRole) {
      return false;
    }

    return this.fapDataSource
      .getUserFapsByRoleAndFapId(agent.id, agent.currentRole, fapId)
      .then((userFaps) => userFaps.length > 0);
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
    const isFapMember = await this.isMemberOfFap(agent);
    const isApiAccessToken = this.isApiToken(agent);
    const isInternalReviewer = await this.isInternalReviewer(agent);
    if (
      isUserOfficer ||
      isInstrumentScientist ||
      isFapMember ||
      isApiAccessToken ||
      isInternalReviewer
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

    const relatedFapUsers = await this.fapDataSource.getRelatedUsersOnFap(
      agent.id
    );

    const allReviewersOnInternalReview =
      await this.internalReviewDataSource.getAllReviewersOnInternalReview(
        agent.id
      );

    const availableUsers = [
      ...self,
      ...ids.filter((id) => relatedProposalUsers.includes(id)),
      ...ids.filter((id) => relatedVisitorUsers.includes(id)),
      ...ids.filter((id) => relatedFapUsers.includes(id)),
      ...ids.filter((id) => allReviewersOnInternalReview.includes(id)),
    ];

    return availableUsers;
  }

  async canReadUser(agent: UserWithRole | null, id: number): Promise<boolean> {
    const readableUsers = await this.listReadableUsers(agent, [id]);

    return readableUsers.includes(id);
  }

  abstract externalTokenLogin(
    token: string,
    redirectUri: string
  ): Promise<User | null>;

  abstract logout(token: AuthJwtPayload): Promise<string | Rejection>;

  abstract isExternalTokenValid(externalToken: string): Promise<boolean>;
}
