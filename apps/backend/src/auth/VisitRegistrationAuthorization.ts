import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { UserWithRole } from '../models/User';
import {
  VisitRegistration,
  VisitRegistrationStatus,
} from '../models/VisitRegistration';
import { UserAuthorization } from './UserAuthorization';

type VisitRegistrationCompositeKey = Pick<
  VisitRegistration,
  'visitId' | 'userId'
>;

@injectable()
export class VisitRegistrationAuthorization {
  constructor(
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  private async resolveVisitRegistration({
    visitId,
    userId,
  }: VisitRegistrationCompositeKey): Promise<VisitRegistration | null> {
    const registration = await this.visitDataSource.getRegistration(
      userId,
      visitId
    );

    return registration;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    visitregistration: VisitRegistration
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    visitId: VisitRegistrationCompositeKey
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    visitOrVisitId: VisitRegistration | VisitRegistrationCompositeKey
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const visitregistration =
      await this.resolveVisitRegistration(visitOrVisitId);

    if (!visitregistration) {
      return false;
    }

    /*
     * User can read is own visitregistration
     */
    return visitregistration.userId === agent.id;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    visitregistration: VisitRegistration
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    visitId: VisitRegistrationCompositeKey
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    visitOrVisitId: VisitRegistration | VisitRegistrationCompositeKey
  ) {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const visitregistration =
      await this.resolveVisitRegistration(visitOrVisitId);

    if (!visitregistration) {
      return false;
    }

    /*
     * User can modify is own visitregistration if it is in Draft
     */
    return (
      visitregistration.userId === agent.id &&
      visitregistration.status === VisitRegistrationStatus.DRAFTED
    );
  }
}
