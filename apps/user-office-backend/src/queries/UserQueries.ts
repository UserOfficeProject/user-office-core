import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import {
  BasicUserDetails,
  UserWithRole,
  AuthJwtPayload,
  UserRole,
  AuthJwtApiTokenPayload,
} from '../models/User';
import { UsersArgs } from '../resolvers/queries/UsersQuery';
import { verifyToken } from '../utils/jwt';

@injectable()
export default class UserQueries {
  constructor(
    @inject(Tokens.UserDataSource) public dataSource: UserDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  async getAgent(id: number) {
    return this.dataSource.getUser(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, id: number) {
    return this.dataSource.getUser(id);
  }

  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.getUser(id);
  }

  @Authorized()
  async me(agent: UserWithRole | null) {
    return this.dataSource.me((agent as UserWithRole).id);
  }

  @Authorized()
  async getBasic(agent: UserWithRole | null, id: number) {
    const user = await this.dataSource.getBasicUserInfo(id);
    const hasPermissions = await this.userAuth.canReadUser(agent, id);
    if (hasPermissions && user) {
      return new BasicUserDetails(
        user.id,
        user.firstname,
        user.lastname,
        user.preferredname,
        user.organisation,
        user.organizationId,
        user.position,
        user.created,
        user.placeholder,
        user.email
      );
    } else {
      return null;
    }
  }

  @Authorized()
  async getBasicUserDetailsByEmail(
    agent: UserWithRole | null,
    email: string,
    role?: UserRole
  ) {
    const user = await this.dataSource.getBasicUserDetailsByEmail(email, role);
    if (!user) {
      return null;
    }

    return new BasicUserDetails(
      user.id,
      user.firstname,
      user.lastname,
      user.preferredname,
      user.organisation,
      user.organizationId,
      user.position,
      user.created,
      user.placeholder,
      user.email
    );
  }

  async checkEmailExist(agent: UserWithRole | null, email: string) {
    return this.dataSource.checkEmailExist(email);
  }

  @Authorized()
  async getAll(agent: UserWithRole | null, args: UsersArgs) {
    const userData = await this.dataSource.getUsers(args);

    const returnableUserIds = await this.userAuth.listReadableUsers(
      agent,
      userData.users.map((u) => u.id)
    );

    const returnableUsers = userData.users.filter((u) =>
      returnableUserIds.includes(u.id)
    );

    return {
      totalCount: userData.totalCount,
      users: returnableUsers,
    };
  }

  @Authorized()
  async getPreviousCollaborators(
    agent: UserWithRole | null,
    userId: number,
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: UserRole,
    subtractUsers?: [number]
  ) {
    return this.dataSource.getPreviousCollaborators(
      userId,
      filter,
      first,
      offset,
      userRole,
      subtractUsers
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async getRoles(agent: UserWithRole | null) {
    return this.dataSource.getRoles();
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getUser(agent: UserWithRole | null, id: number) {
    return this.dataSource.getUser(id);
  }

  @Authorized()
  async getProposers(agent: UserWithRole | null, proposalPk: number) {
    return this.dataSource.getProposalUsers(proposalPk);
  }

  async checkToken(token: string): Promise<{
    isValid: boolean;
    payload: AuthJwtPayload | AuthJwtApiTokenPayload | null;
  }> {
    try {
      const payload = verifyToken<AuthJwtPayload | AuthJwtApiTokenPayload>(
        token
      );

      if (!('user' in payload) && !('accessTokenId' in payload)) {
        throw new Error('Unknown or malformed token');
      }

      return {
        isValid: true,
        payload,
      };
    } catch (error) {
      logger.logException('Bad token', error, { token });

      return {
        isValid: false,
        payload: null,
      };
    }
  }
}
