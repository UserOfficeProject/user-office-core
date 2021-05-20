import { User } from 'generated/sdk';

export const getFullUserName = (
  user?: Pick<User, 'firstname' | 'lastname'> | null
): string => (user ? `${user.firstname} ${user.lastname}` : 'None');
