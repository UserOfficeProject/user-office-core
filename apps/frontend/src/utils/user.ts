import { BasicUserDetails } from 'generated/sdk';

export const getFullUserName = (
  user?: Pick<BasicUserDetails, 'preferredname' | 'lastname'> | null
): string => (user ? `${user.preferredname} ${user.lastname}` : 'None');

export const getFullUserNameWithEmail = (
  user?: Pick<BasicUserDetails, 'preferredname' | 'lastname' | 'email'> | null
): string =>
  user
    ? `${user.preferredname} ${user.lastname} ${
        user.email ? `(${user.email})` : ''
      }`
    : 'None';
