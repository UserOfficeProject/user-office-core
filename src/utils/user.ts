import { User } from 'generated/sdk';

export const getFullUserName = (
  user?: Pick<User, 'firstname' | 'lastname'> | null
): string => (user ? `${user.firstname} ${user.lastname}` : 'None');

export const getFullUserNameWithEmail = (
  user?: Pick<User, 'firstname' | 'lastname' | 'email'> | null
): string =>
  user ? `${user.firstname} ${user.lastname}(${user.email})` : 'None';
