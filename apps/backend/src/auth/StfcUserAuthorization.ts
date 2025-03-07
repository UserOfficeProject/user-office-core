import { error } from 'console';

import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable, container } from 'tsyringe';

import {
  BasicPersonDetailsDTO,
  LoginDTO,
  RoleDTO,
  TokenWrapperDTO,
} from '../../generated';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import {
  StfcBasicPersonDetails,
  toStfcBasicPersonDetails,
} from '../datasources/stfc/StfcUserDataSource';
import { createUOWSClient } from '../datasources/stfc/UOWSClient';
import { Instrument } from '../models/Instrument';
import { Rejection, rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { AuthJwtPayload, User, UserWithRole } from '../models/User';
import { Cache } from '../utils/Cache';
import { StfcUserDataSource } from './../datasources/stfc/StfcUserDataSource';
import { UserAuthorization } from './UserAuthorization';

const UOWSClient = createUOWSClient();

const stfcInstrumentScientistRolesToInstrument: Record<string, string[]> = {
  'User Officer': ['ISIS', 'HPL', 'LSF'],
  'ISIS Instrument Scientist': ['ISIS'],
  'CLF HPL FAP Secretary': ['HPL'],
  'CLF HPL Link Scientist': ['HPL'],
  'CLF LSF FAP Secretary': ['LSF'],
  'CLF LSF Link Scientist': ['LSF'],
};

@injectable()
export class StfcUserAuthorization extends UserAuthorization {
  private static readonly tokenCacheMaxElements = 1000;
  private static readonly tokenCacheSecondsToLive = 600; // 10 minutes

  private uowsTokenCache = new Cache<Promise<boolean>>(
    StfcUserAuthorization.tokenCacheMaxElements,
    StfcUserAuthorization.tokenCacheSecondsToLive
  ).enableStatsLogging('uowsTokenCache');

  protected instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );

  protected userDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;

  getRequiredInstrumentForRole(roles: RoleDTO[]) {
    return roles
      .flatMap((role) => stfcInstrumentScientistRolesToInstrument[role.name!])
      .filter((instrumentName) => instrumentName);
  }

  async getInstrumentsToAdd(
    requiredInstrumentNames: string[],
    currentInstruments: Instrument[]
  ) {
    // Get the names of currently assigned instruments
    const currentInstrumentNames = currentInstruments.map(
      (instrument) => instrument.name
    );

    // Get the required instrument names which aren't currently assigned
    const instrumentNamesToAssign = requiredInstrumentNames.filter(
      (name) => !currentInstrumentNames.includes(name)
    );

    // We can only assign required instruments if they exist in the DB.
    // This may not be the case, as User Officers can rename or delete instruments.
    // Here, we check if the instruments we expect are in the DB
    // and log a warning for the ones we didn't find
    const instrumentsToAssign =
      await this.instrumentDataSource.getInstrumentsByNames(
        instrumentNamesToAssign
      );

    const instrumentNamesNotFound = instrumentNamesToAssign.filter(
      (instrumentName) =>
        !instrumentsToAssign.find(
          (instrument) => instrument.name === instrumentName
        )
    );

    if (instrumentNamesNotFound.length > 0) {
      logger.logWarn(
        'Could not find instruments while auto-assigning STFC instrument scientist',
        {
          instruments: instrumentNamesNotFound,
        }
      );
    }

    return instrumentsToAssign.map((instrument) => instrument.id);
  }

  async getInstrumentsToRemove(
    requiredInstrumentNames: string[],
    currentInstruments: Instrument[]
  ) {
    // Remove instrument scientist from any instruments they are assigned to,
    // but shouldn't be.
    // We don't need to check if the instruments exist here,
    // because we fetch the list of currently assigned instruments from the DB
    return currentInstruments
      .filter(
        (instrument) => !requiredInstrumentNames.includes(instrument.name)
      )
      .map((instrument) => instrument.id);
  }

  async autoAssignRemoveInstruments(
    userId: number,
    requiredInstrumentNames: string[],
    currentInstruments: Instrument[],
    removeInstruments: boolean
  ) {
    // Assign any instruments which aren't currently assigned
    const instrumentsToAdd = await this.getInstrumentsToAdd(
      requiredInstrumentNames,
      currentInstruments
    );

    if (instrumentsToAdd.length > 0) {
      logger.logInfo(
        'Auto-assigning STFC instrument scientist to instruments',
        {
          instruments: instrumentsToAdd,
        }
      );

      this.instrumentDataSource.assignScientistToInstruments(
        userId,
        instrumentsToAdd
      );
    }

    if (removeInstruments) {
      // Remove any instruments which are currently assigned, but not required
      const instrumentsToRemove = await this.getInstrumentsToRemove(
        requiredInstrumentNames,
        currentInstruments
      );

      if (instrumentsToRemove.length > 0) {
        logger.logInfo(
          'Auto-removing STFC instrument scientist from instruments',
          {
            instruments: instrumentsToRemove,
          }
        );

        this.instrumentDataSource.removeScientistFromInstruments(
          userId,
          instrumentsToRemove
        );
      }
    }
  }

  async externalTokenLogin(
    token: string,
    _redirecturi: string
  ): Promise<User | null> {
    const loginBySession: LoginDTO =
      await UOWSClient.sessions.getLoginBySessionId(token);
    if (!loginBySession) {
      const rethrowMessage =
        'Failed to fetch user details for STFC external authentication using getLoginBySessionId';
      logger.logWarn(rethrowMessage, {
        token: token,
      });
    }
    const stfcUserTemp: BasicPersonDetailsDTO[] | null =
      await UOWSClient.basicPersonDetails
        .getBasicPersonDetails(undefined, undefined, undefined, [
          loginBySession.userId,
        ])
        .then((rawStfcUser) => rawStfcUser)
        .catch((error) => {
          const rethrowMessage =
            'Failed to fetch user details for STFC external authentication using getLoginBySessionId';
          logger.logWarn(rethrowMessage, {
            cause: error,
            token: token,
          });

          throw new GraphQLError(rethrowMessage);
        });

    if (!stfcUserTemp) {
      logger.logInfo('No user found for STFC external authentication', {
        externalToken: token,
      });

      return null;
    }

    const stfcUser: StfcBasicPersonDetails | null = toStfcBasicPersonDetails(
      stfcUserTemp[0]
    );

    // Create dummy user if one does not exist in the proposals DB.
    // This is needed to satisfy the FOREIGN_KEY constraints
    // in tables that link to a user (such as proposals)
    let userNumber;
    let dummyUser;
    if (stfcUser!.userNumber != null) {
      userNumber = parseInt(stfcUser!.userNumber);
      dummyUser = await this.userDataSource.ensureDummyUserExists(userNumber);
    } else {
      logger.logError('There has been an error creating a dummy user', {
        error,
      });
      throw error;
    }

    // With dummyUser created and written (ensureDummyUserExists), info can now
    // be added to it without persisting it to the database, which is not wanted.
    // This info is used in the userContext.
    dummyUser.email = stfcUser!.email;
    dummyUser.firstname = stfcUser!.givenName;
    dummyUser.preferredname = stfcUser!.firstNameKnownAs;
    dummyUser.lastname = stfcUser!.familyName;

    // Auto-assign users to instruments.
    // This will happen if the user is an instrument scientist for an STFC facility
    const stfcRoles: RoleDTO[] | null =
      await this.userDataSource.getRolesForUser(userNumber);

    if (stfcRoles) {
      // The UOWS sometimes returns duplicate roles. We remove them here
      const uniqueRoles = stfcRoles.filter(
        (role, index) =>
          stfcRoles.findIndex((r) => r.name == role.name) === index
      );

      const requiredInstruments =
        this.getRequiredInstrumentForRole(uniqueRoles);

      const currentUserInstruments =
        await this.instrumentDataSource.getUserInstruments(userNumber);

      // Don't remove instruments from ISIS Staff and User officers as these will be manually assigned
      this.autoAssignRemoveInstruments(
        userNumber,
        requiredInstruments,
        currentUserInstruments,
        !uniqueRoles.find(
          (role) =>
            role.name === 'ISIS Instrument Scientist' ||
            role.name === 'User Officer'
        )
      );
    }

    return dummyUser;
  }

  async logout(uosToken: AuthJwtPayload): Promise<string | Rejection> {
    try {
      const token = uosToken.externalToken;
      if (token) {
        this.uowsTokenCache.remove(token);

        const isValidToken = await this.isExternalTokenValid(token);

        if (!isValidToken) {
          logger.logInfo(
            'UOWS token found to be invalid, skipping UOWS logout call',
            { token }
          );

          return Promise.resolve('User already logged out');
        }

        return await UOWSClient.sessions
          .logout(token)
          .then(() => {
            return 'Successfully logged out user';
          })
          .catch((ex: string): Rejection | string => {
            if (ex === 'The token given is invalid') {
              logger.logInfo(
                'Logout failed because the cached token has since expired',
                { token }
              );

              return 'User already logged out';
            }

            logger.logWarn('Failed to log out user', { token });

            return rejection('Failed to log out user', { token });
          });
      } else {
        return rejection('No external token found in JWT', { token });
      }
    } catch (error) {
      return rejection('Error occurred during external logout', {}, error);
    }
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    const cachedValidity = await this.uowsTokenCache.get(token);
    if (cachedValidity !== undefined) {
      if (!cachedValidity) {
        this.uowsTokenCache.remove(token);
      }

      return cachedValidity;
    }

    const stfcToken: TokenWrapperDTO = {
      token: token,
    };

    const tokenRequest = UOWSClient.token
      .validateToken(stfcToken)
      .then((response) => {
        return response.identifier !== undefined;
      })
      .catch((error) => {
        logger.logError(
          'An error occurred while validating the token using validateToken',
          error
        );

        return false;
      });

    this.uowsTokenCache.put(token, tokenRequest);

    const isValid = await tokenRequest;
    // Only keep valid tokens cached to avoid locking out users for a long time
    if (!isValid) {
      this.uowsTokenCache.remove(token);
    }

    return isValid;
  }

  override async isInternalUser(
    userId: number,
    currentRole: Role
  ): Promise<boolean> {
    if (currentRole) {
      if (
        currentRole?.shortCode === Roles.INSTRUMENT_SCIENTIST ||
        currentRole?.shortCode === Roles.USER_OFFICER
      ) {
        return true;
      }
    }

    return userId
      ? this.userDataSource.getRolesForUser(userId).then((roles) => {
          return roles.some(
            (role) =>
              role.name === 'Internal proposal submitter' ||
              role.name === 'ISIS Instrument Scientist' ||
              role.name === 'User Officer'
          );
        })
      : false;
  }

  async canReadUser(agent: UserWithRole | null, id: number): Promise<boolean> {
    const readableUsers = await this.listReadableUsers(agent, [id]);

    return (
      readableUsers.includes(id) ||
      (await this.userDataSource.isSearchableUser(id))
    );
  }
}
