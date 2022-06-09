import { logger } from '@user-office-software/duo-logger';
import * as bcrypt from 'bcryptjs';
// TODO: Try to replace request-promise with axios. request-promise depends on request which is deprecated.
import { CoreOptions, UriOptions } from 'request';
import rp from 'request-promise';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
import { Role, Roles } from '../models/Role';
import {
  BasicUserDetails,
  User,
  UserWithRole,
  AuthJwtPayload,
  UserRole,
  AuthJwtApiTokenPayload,
} from '../models/User';
import { UsersArgs } from '../resolvers/queries/UsersQuery';
import { signToken, verifyToken } from '../utils/jwt';

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
        user.position,
        user.created,
        user.placeholder
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
      user.position,
      user.created,
      user.placeholder
    );
  }

  async checkEmailExist(agent: UserWithRole | null, email: string) {
    return this.dataSource.checkEmailExist(email);
  }

  async getOrcIDAccessToken(authorizationCode: string) {
    const options: CoreOptions & UriOptions = {
      method: 'POST',
      uri: process.env.ORCID_TOKEN_URL as string,
      qs: {
        client_id: process.env.ORCID_CLIENT_ID,
        client_secret: process.env.ORCID_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: authorizationCode,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      json: true, // Automatically parses the JSON string in the response
    };

    return rp(options)
      .then(function (resp: any) {
        return {
          ...resp,
        };
      })
      .catch(function (err: any) {
        logger.logException('Could not get getOrcIDAccessToken', err);

        return null;
      });
  }

  async getOrcIDInformation(authorizationCode: string) {
    // If in development fake response
    if (process.env.NODE_ENV === 'development') {
      return {
        orcid: '0000-0000-0000-0000',
        orcidHash: 'asdadgiuerervnaofhioa',
        refreshToken: 'asdadgiuerervnaofhioa',
        firstname: 'Kalle',
        lastname: 'Kallesson',
      };
    }

    const orcData = await this.getOrcIDAccessToken(authorizationCode);
    if (!orcData) {
      return null;
    }

    const user = await this.dataSource.getByOrcID(orcData.orcid);
    if (user) {
      const roles = await this.dataSource.getUserRoles(user.id);

      const token = signToken<{ user: User; roles: Role[]; currentRole: Role }>(
        { user, roles, currentRole: roles[0] }
      );

      return { token };
    }
    const options = {
      uri: `${process.env.ORCID_API_URL}${orcData.orcid}/person`,
      headers: {
        Accept: 'application/vnd.orcid+json',
        Authorization: `Bearer ${orcData.access_token}`,
      },
      json: true, // Automatically parses the JSON string in the response
    };

    return rp(options)
      .then(function (resp: any) {
        // Generate hash for OrcID inorder to prevent user from change OrcID when sending back
        const salt = '$2a$10$1svMW3/FwE5G1BpE7/CPW.';
        const hash = bcrypt.hashSync(resp.name.path, salt);

        return {
          orcid: resp.name.path,
          orcidHash: hash,
          refreshToken: orcData.refresh_token,
          firstname: resp.name['given-names']
            ? resp.name['given-names'].value
            : null,
          lastname: resp.name['family-name']
            ? resp.name['family-name'].value
            : null,
        };
      })
      .catch(function (err: any) {
        logger.logException('Could not get getOrcIDInformation', err);

        return null;
      });
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
