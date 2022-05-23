import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import {
  StfcBasicPersonDetails,
  stfcRole,
} from '../datasources/stfc/StfcUserDataSource';
import UOWSSoapClient from '../datasources/stfc/UOWSSoapInterface';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Instrument } from '../models/Instrument';
import { User } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

const client = new UOWSSoapClient(process.env.EXTERNAL_AUTH_SERVICE_URL);

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
  constructor(
    @inject(Tokens.UserDataSource) protected userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) protected sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    protected proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource) protected visitDataSource: VisitDataSource,
    @inject(Tokens.InstrumentDataSource)
    protected instrumentDataSource: InstrumentDataSource
  ) {
    super(userDataSource, sepDataSource, proposalDataSource, visitDataSource);
  }

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

  async externalTokenLogin(token: string): Promise<User | null> {
    const stfcUser: StfcBasicPersonDetails | null = await client
      .getPersonDetailsFromSessionId(token)
      .then((rawStfcUser) => rawStfcUser.return)
      .catch((error) => {
        const rethrowMessage =
          'Failed to fetch user details for STFC external authentication';
        logger.logWarn(rethrowMessage, {
          cause: error,
          token: token,
        });

        throw new Error(rethrowMessage);
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
          stfcRoles.findIndex((r) => r.name == role.name) !== index
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

  async logout(token: string): Promise<void> {
    await client.logout(token).catch(() => {
      logger.logWarn('Failed to log out user', { token });
      throw new Error(`Failed to logout ${token}`);
    });

    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    const result = await client.isTokenValid(token);

    return result.return;
  }
}
