import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserRole, UserWithRole } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class RoleClaimAuthorization {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  public async hasCreateRights(agent: UserWithRole | null, roles: UserRole[]) {
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);
    const onlyUserRole = roles.length === 1 && roles[0] === UserRole.USER;

    return isUserOfficer || onlyUserRole;
  }
}
