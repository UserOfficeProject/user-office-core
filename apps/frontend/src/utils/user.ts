import { BasicUserDetails } from 'generated/sdk';

export const getFullUserName = (
  user?: Pick<BasicUserDetails, 'firstname' | 'lastname'> | null
): string => (user ? `${user.firstname} ${user.lastname}` : 'None');

export const getFullUserNameWithEmail = (
  user?: Pick<BasicUserDetails, 'firstname' | 'lastname' | 'email'> | null
): string =>
  user
    ? `${user.firstname} ${user.lastname} ${
        user.email ? `(${user.email})` : ''
      }`
    : 'None';
