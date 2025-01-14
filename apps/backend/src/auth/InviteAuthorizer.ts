import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserRole, UserWithRole } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class InviteAuthorization {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  public isRoleInviteAuthorized = async (
    agent: UserWithRole | null,
    roleIds?: number[]
  ) => {
    if (roleIds === undefined || roleIds.length === 0) return true;

    const onlyUserRole = roleIds.length === 1 && roleIds[0] === UserRole.USER;
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    return isUserOfficer || onlyUserRole;
  };
}
