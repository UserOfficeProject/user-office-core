import { BasicUserDetails } from 'generated/sdk';

export const getFullUserName = (
  user?: Pick<
    BasicUserDetails,
    'preferredname' | 'lastname' | 'firstname'
  > | null
): string =>
  user
    ? `${user.preferredname}`
      ? `${user.preferredname} ${user.lastname}`
      : `${user.firstname} ${user.lastname}`
    : 'None';

export const getFullUserNameWithEmail = (
  user?: Pick<
    BasicUserDetails,
    'preferredname' | 'lastname' | 'email' | 'firstname'
  > | null
): string =>
  user
    ? `${user.preferredname}`
      ? `${user.preferredname} ${user.lastname} ${
          user.email ? `(${user.email})` : ''
        }`
      : `${user.firstname} ${user.lastname} ${
          user.email ? `(${user.email})` : ''
        }`
    : 'None';
