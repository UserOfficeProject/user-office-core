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
    // If no roleIds are provided, the invite is considered as authorized
    if (roleIds === undefined || roleIds.length === 0) return true;

    if (this.userAuth.isUserOfficer(agent)) return true;

    const onlyUserRole = roleIds.length === 1 && roleIds[0] === UserRole.USER;

    return onlyUserRole;
  };
}
