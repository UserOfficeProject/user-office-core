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
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import {
  StfcBasicPersonDetails,
  toStfcBasicPersonDetails,
} from '../datasources/stfc/StfcUserDataSource';
import { createUOWSClient } from '../datasources/stfc/UOWSClient';
import { Facility } from '../models/Facility';
import { Rejection, rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { AuthJwtPayload, User, UserWithRole } from '../models/User';
import { Cache } from '../utils/Cache';
import { StfcUserDataSource } from './../datasources/stfc/StfcUserDataSource';
import { UserAuthorization } from './UserAuthorization';

const UOWSClient = createUOWSClient();

const stfcInstrumentScientistRolesToFacility: Record<string, string[]> = {
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

  protected facilityDataSource: FacilityDataSource = container.resolve(
    Tokens.FacilityDataSource
  );

  protected userDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;

  getRequiredFacilityForRole(roles: RoleDTO[]) {
    return roles
      .flatMap((role) => stfcInstrumentScientistRolesToFacility[role.name!])
      .filter((facilityName) => facilityName);
  }

  async getFacilitiesToAdd(
    requiredFacilityNames: string[],
    currentFacilities: Facility[]
  ) {
    // Get the names of currently assigned facilities
    const currentFacilityNames = currentFacilities.map(
      (facility) => facility.name
    );

    // Get the required facilities names which aren't currently assigned
    const FacilityNamesToAssign = requiredFacilityNames.filter(
      (name) => !currentFacilityNames.includes(name)
    );

    // We can only assign required facilities if they exist in the DB.
    // This may not be the case, as User Officers can rename or delete instruments.
    // Here, we check if the instruments we expect are in the DB
    // and log a warning for the ones we didn't find
    const facilitiesToAssign =
      await this.facilityDataSource.getFacilitiesByNames(FacilityNamesToAssign);

    const facilityNamesNotFound = FacilityNamesToAssign.filter(
      (facilityName) =>
        !facilitiesToAssign.find(
          (facilities) => facilities.name === facilityName
        )
    );

    if (facilityNamesNotFound.length > 0) {
      logger.logWarn(
        'Could not find facilities while auto-assigning STFC instrument scientist',
        {
          facilities: facilityNamesNotFound,
        }
      );
    }

    return facilitiesToAssign.map((facilities) => facilities.id);
  }

  async getFacilitiesToRemove(
    requiredFacilityNames: string[],
    currentFacilities: Facility[]
  ) {
    return currentFacilities
      .filter((facility) => !requiredFacilityNames.includes(facility.name))
      .map((facility) => facility.id);
  }

  async autoAssignRemoveFacilities(
    userId: number,
    requiredFacilityNames: string[],
    currentFacilities: Facility[],
    removeFacilities: boolean
  ) {
    // Assign any facilities which aren't currently assigned
    const facilitiesToAdd = await this.getFacilitiesToAdd(
      requiredFacilityNames,
      currentFacilities
    );

    if (facilitiesToAdd.length > 0) {
      logger.logInfo('Auto-assigning STFC instrument scientist to facilities', {
        facilities: facilitiesToAdd,
      });

      facilitiesToAdd.map((facility) =>
        this.facilityDataSource.addUsersToFacility([userId], facility)
      );
    }

    if (removeFacilities) {
      // Remove any instruments which are currently assigned, but not required
      const facilitiesToRemove = await this.getFacilitiesToRemove(
        requiredFacilityNames,
        currentFacilities
      );

      if (facilitiesToRemove.length > 0) {
        logger.logInfo(
          'Auto-removing STFC instrument scientist from facilities',
          {
            facilities: facilitiesToRemove,
          }
        );

        facilitiesToRemove.map((facility) =>
          this.facilityDataSource.removeUserFromFacility(userId, facility)
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

      const requiredFacilities = this.getRequiredFacilityForRole(uniqueRoles);

      const currentUserFacility =
        await this.facilityDataSource.getUsersFacilities(userNumber);

      // Don't remove instruments from ISIS Staff and User officers as these will be manually assigned

      this.autoAssignRemoveFacilities(
        userNumber,
        requiredFacilities,
        currentUserFacility,
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
