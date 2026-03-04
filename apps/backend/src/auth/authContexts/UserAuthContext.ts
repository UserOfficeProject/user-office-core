import { injectable } from 'tsyringe';

import { UserWithRole } from '../../models/User';
import { AuthContext } from '../AuthRegistry';

export interface UserContextData extends AuthContext {
  type: 'user';
  id: number;
  currentRole: string;
  isInternalUser?: boolean;
}

export const USER_AUTH_UI_ATTRIBUTES: Array<keyof UserContextData> = [
  'id',
  'currentRole',
  'isInternalUser',
];

@injectable()
export class UserAuthContext {
  constructor() {}

  async toContextData(
    user: UserWithRole | null
  ): Promise<UserContextData | null> {
    if (!user || !user.currentRole?.shortCode) {
      return null;
    }

    return {
      type: 'user',
      id: user.id,
      currentRole: user.currentRole.shortCode,
      isInternalUser: user.isInternalUser,
    };
  }
}
