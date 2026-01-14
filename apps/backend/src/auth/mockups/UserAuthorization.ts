import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { dummyInstitution } from '../../datasources/mockups/AdminDataSource';
import { dummyUser } from '../../datasources/mockups/UserDataSource';
import { Institution } from '../../models/Institution';
import { Role } from '../../models/Role';
import { AuthJwtPayload, User } from '../../models/User';
import {
  GetOrCreateInstitutionInput,
  InstitutionManualInput,
} from '../../resolvers/mutations/UpsertUserMutation';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class UserAuthorizationMock extends UserAuthorization {
  // Mock institution data for testing
  private mockInstitutions: Institution[] = [
    dummyInstitution,
    new Institution(
      3,
      'Dummy Research Institute',
      3,
      'https://ror.org/dummy001'
    ),
    new Institution(4, 'Test University', 4, 'https://ror.org/dummy002'),
    new Institution(5, 'Mock Academic Center', 4, 'https://ror.org/dummy003'),
  ];

  private getNextInstitutionId(): number {
    return (
      Math.max(...this.mockInstitutions.map((institution) => institution.id)) +
      1
    );
  }

  async getOrCreateUserInstitution(
    institutionInput: GetOrCreateInstitutionInput
  ): Promise<Institution> {
    if (typeof institutionInput === 'string') {
      // ROR ID provided
      return this.getOrCreateInstitutionByRorId(institutionInput);
    } else if (institutionInput instanceof InstitutionManualInput) {
      // Manual institution details provided
      return this.getOrCreateInstitutionByManualInput(institutionInput);
    } else if (typeof institutionInput === 'number') {
      // Institution ID provided
      return this.getOrCreateInstitutionById(institutionInput);
    }

    return this.mockInstitutions[0];
  }

  private getOrCreateInstitutionByRorId(rorId: string): Institution {
    let institution = this.mockInstitutions.find(
      (inst) => inst.rorId === rorId
    );
    if (!institution) {
      institution = new Institution(
        this.getNextInstitutionId(),
        'New Institution',
        1,
        rorId
      );
      this.mockInstitutions.push(institution);
    }

    return institution;
  }

  private getOrCreateInstitutionByManualInput(
    manualInput: InstitutionManualInput
  ): Institution {
    let institution = this.mockInstitutions.find(
      (inst) => inst.name.toLowerCase() === manualInput.name.toLowerCase()
    );
    if (!institution) {
      institution = new Institution(
        this.getNextInstitutionId(),
        manualInput.name,
        1,
        undefined
      );
      this.mockInstitutions.push(institution);
    }

    return institution;
  }

  private getOrCreateInstitutionById(id: number): Institution {
    const institution = this.mockInstitutions.find((inst) => inst.id === id);

    return institution || this.mockInstitutions[0];
  }

  async externalTokenLogin(
    token: string,
    _redirectUri: string
  ): Promise<User | null> {
    if (token === 'valid') {
      return dummyUser;
    }

    return null;
  }
  async isInternalUser(userId: number, currentRole: Role): Promise<boolean> {
    return true;
  }
  async logout(token: AuthJwtPayload): Promise<string> {
    return 'logged out';
  }
  async isExternalTokenValid(externalToken: string): Promise<boolean> {
    return true;
  }
}
