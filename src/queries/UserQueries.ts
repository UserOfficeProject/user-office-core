/* eslint-disable @typescript-eslint/camelcase */
import * as bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
// TODO: Try to replace request-promise with axios. request-promise depends on reqest which is deprecated.
import { CoreOptions, UriOptions } from 'request';
import rp from 'request-promise';

import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { User, BasicUserDetails } from '../models/User';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class UserQueries {
  constructor(
    private dataSource: UserDataSource,
    private userAuth: UserAuthorization
  ) {}

  async getAgent(id: number) {
    return this.dataSource.get(id);
  }

  // TODO: Maybe we should have another endpoint for getting logged in user data. Something like `me()` or `userMe()`
  @Authorized([Roles.USER_OFFICER, Roles.USER])
  async get(agent: User | null, id: number) {
    return this.dataSource.get(id);
  }

  @Authorized()
  async getBasic(agent: User | null, id: number) {
    const user = await this.dataSource.getBasicUserInfo(id);
    if (!user) {
      return null;
    }

    return new BasicUserDetails(
      user.id,
      user.firstname,
      user.lastname,
      user.organisation,
      user.position
    );
  }

  async checkEmailExist(agent: User | null, email: string) {
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
      .then(function(resp: any) {
        return {
          ...resp,
        };
      })
      .catch(function(err: any) {
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
      const secret = process.env.secret as string;
      const token = jsonwebtoken.sign({ user, roles }, secret, {
        expiresIn: process.env.tokenLife,
      });

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
      .then(function(resp: any) {
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
      .catch(function(err: any) {
        logger.logException('Could not get getOrcIDInformation', err);

        return null;
      });
  }

  @Authorized()
  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number,
    userRole?: number,
    subtractUsers?: [number]
  ) {
    return this.dataSource.getUsers(
      filter,
      first,
      offset,
      userRole,
      subtractUsers
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async getRoles(agent: User | null) {
    return this.dataSource.getRoles();
  }

  async getUser(id: number) {
    return this.dataSource.get(id);
  }

  async getProposers(agent: User | null, proposalId: number) {
    return this.dataSource.getProposalUsers(proposalId);
  }
}
