import { BasicUserDetails } from 'generated/sdk';
import { BasicUserData } from 'hooks/user/useUserData';

export const getFullUserName = (
  user?: Pick<BasicUserDetails, 'firstname' | 'lastname'> | null
): string => (user ? `${user.firstname} ${user.lastname}` : 'None');

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

export const getFullUserNameWithInstitution = (
  user?: BasicUserData | null
): string =>
  user
    ? `${user.preferredname}`
      ? `${user.preferredname} ${user.lastname}; ${
          user.institution ? `${user.institution}` : ''
        }`
      : `${user.firstname} ${user.lastname}; ${
          user.institution ? `${user.institution}` : ''
        }`
    : 'None';
