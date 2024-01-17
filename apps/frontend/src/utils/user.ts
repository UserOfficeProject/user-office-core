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

export const getFullUserNameWithOrganisation = (
  user?: BasicUserData | null
): string =>
  user
    ? `${user.preferredname}`
      ? `${user.preferredname} ${user.lastname}; ${
          user.organisation ? `${user.organisation}` : ''
        }`
      : `${user.firstname} ${user.lastname}; ${
          user.organisation ? `${user.organisation}` : ''
        }`
    : 'None';
