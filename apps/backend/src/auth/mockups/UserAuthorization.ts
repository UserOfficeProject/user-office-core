import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { dummyInstitution } from '../../datasources/mockups/AdminDataSource';
import { dummyUser } from '../../datasources/mockups/UserDataSource';
import { Institution } from '../../models/Institution';
import { Role } from '../../models/Role';
import { AuthJwtPayload, User } from '../../models/User';
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

  async getOrCreateUserInstitution(userInfo: {
    institution_ror_id?: string;
    institution_name?: string;
    institution_country?: string;
  }): Promise<Institution | null> {
    // Return default institution if all fields are empty or unspecified
    if (
      (!userInfo.institution_name || userInfo.institution_name.trim() === '') &&
      (!userInfo.institution_ror_id ||
        userInfo.institution_ror_id.trim() === '')
    ) {
      return this.mockInstitutions[0]; // Return dummyInstitution as default
    }

    // Try to find existing institution by ROR ID first (most reliable)
    if (userInfo.institution_ror_id) {
      const existingByRor = this.mockInstitutions.find(
        (inst) => inst.rorId === userInfo.institution_ror_id
      );
      if (existingByRor) {
        return existingByRor;
      }
    }

    // Try to find existing institution by name (case-insensitive)
    if (userInfo.institution_name) {
      const existingByName = this.mockInstitutions.find(
        (inst) =>
          inst.name.toLowerCase() === userInfo.institution_name?.toLowerCase()
      );
      if (existingByName) {
        return existingByName;
      }
    }

    // Create new institution if not found
    const newId = Math.max(...this.mockInstitutions.map((i) => i.id)) + 1;

    const newInstitution = new Institution(
      newId,
      userInfo.institution_name ?? 'Unknown Institution',
      1,
      userInfo.institution_ror_id
    );

    // Add to mock data for subsequent calls
    this.mockInstitutions.push(newInstitution);

    return newInstitution;
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
