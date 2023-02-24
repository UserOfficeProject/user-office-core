import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable, container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import {
  StfcBasicPersonDetails,
  stfcRole,
} from '../datasources/stfc/StfcUserDataSource';
import UOWSSoapClient from '../datasources/stfc/UOWSSoapInterface';
import { Instrument } from '../models/Instrument';
import { Rejection, rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { AuthJwtPayload, User } from '../models/User';
import { LRUCache } from '../utils/LRUCache';
import { StfcUserDataSource } from './../datasources/stfc/StfcUserDataSource';
import { UserAuthorization } from './UserAuthorization';

const client = UOWSSoapClient.getInstance();

const stfcInstrumentScientistRolesToInstrument: Record<string, string[]> = {
  'User Officer': ['ISIS', 'ARTEMIS', 'HPL', 'LSF'],
  'ISIS Instrument Scientist': ['ISIS'],
  'CLF Artemis FAP Secretary': ['ARTEMIS'],
  'CLF Artemis Link Scientist': ['ARTEMIS'],
  'CLF HPL FAP Secretary': ['HPL'],
  'CLF HPL Link Scientist': ['HPL'],
  'CLF LSF FAP Secretary': ['LSF'],
  'CLF LSF Link Scientist': ['LSF'],
};

@injectable()
export class StfcUserAuthorization extends UserAuthorization {
  private static readonly tokenCacheMaxElements = 200;
  private static readonly tokenCacheSecondsToLive = 300; // 5 minutes

  private uowsTokenCache = new LRUCache<boolean>(
    StfcUserAuthorization.tokenCacheMaxElements,
    StfcUserAuthorization.tokenCacheSecondsToLive
  ).enableStatsLogging('uowsTokenCache');

  protected instrumentDataSource: InstrumentDataSource = container.resolve(
    Tokens.InstrumentDataSource
  );

  getRequiredInstrumentForRole(roles: stfcRole[]) {
    return roles
      .flatMap((role) => stfcInstrumentScientistRolesToInstrument[role.name])
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
    currentInstruments: Instrument[]
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

  async externalTokenLogin(
    token: string,
    _redirecturi: string
  ): Promise<User | null> {
    const stfcUser: StfcBasicPersonDetails | null = await client
      .getPersonDetailsFromSessionId(token)
      .then((rawStfcUser) => rawStfcUser?.return)
      .catch((error) => {
        const rethrowMessage =
          'Failed to fetch user details for STFC external authentication';
        logger.logWarn(rethrowMessage, {
          cause: error,
          token: token,
        });

        throw new GraphQLError(rethrowMessage);
      });

    if (!stfcUser) {
      logger.logInfo('No user found for STFC external authentication', {
        externalToken: token,
      });

      return null;
    }

    // Create dummy user if one does not exist in the proposals DB.
    // This is needed to satisfy the FOREIGN_KEY constraints
    // in tables that link to a user (such as proposals)
    const userNumber = parseInt(stfcUser.userNumber);
    const dummyUser = await this.userDataSource.ensureDummyUserExists(
      userNumber
    );

    // With dummyUser created and written (ensureDummyUserExists), info can now
    // be added to it without persisting it to the database, which is not wanted.
    // This info is used in the userContext.
    dummyUser.email = stfcUser.email;
    dummyUser.firstname = stfcUser.givenName;
    dummyUser.preferredname = stfcUser.firstNameKnownAs;
    dummyUser.lastname = stfcUser.familyName;

    // Auto-assign users to instruments.
    // This will happen if the user is an instrument scientist for an STFC facility
    const stfcRoles: stfcRole[] | null = (
      await client.getRolesForUser(process.env.EXTERNAL_AUTH_TOKEN, userNumber)
    )?.return;

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
      this.autoAssignRemoveInstruments(
        userNumber,
        requiredInstruments,
        currentUserInstruments
      );
    }

    return dummyUser;
  }

  async logout(uosToken: AuthJwtPayload): Promise<void | Rejection> {
    try {
      const token = uosToken.externalToken;
      if (token) {
        this.uowsTokenCache.remove(token);

        await client.logout(token).catch(() => {
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
    const cachedValidity = this.uowsTokenCache.get(token);
    if (cachedValidity) {
      return cachedValidity;
    }

    const isValid: boolean = (await client.isTokenValid(token))?.return;
    // Only cache valid tokens to avoid locking out users for a long time
    if (isValid) {
      this.uowsTokenCache.put(token, true);
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
      ? (this.userDataSource as StfcUserDataSource)
          .getRolesForUser(userId)
          .then((roles) => {
            return roles.some(
              (role) =>
                role.name === 'Internal proposal submitter' ||
                role.name === 'ISIS Instrument Scientist' ||
                role.name === 'User Officer'
            );
          })
      : false;
  }
}
