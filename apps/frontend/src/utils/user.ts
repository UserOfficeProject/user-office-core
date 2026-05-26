import { BasicUserDetails } from 'generated/sdk';
import { BasicUserData } from 'hooks/user/useUserData';

export const getPreferredName = (
  user: Pick<BasicUserDetails, 'firstname'> & { preferredname?: string | null }
): string => user.preferredname || user.firstname;

export const getFullUserName = (
  user?:
    | (Pick<BasicUserDetails, 'firstname' | 'lastname'> & {
        preferredname?: string | null;
      })
    | null
): string => (user ? `${getPreferredName(user)} ${user.lastname}` : 'None');

export const getFullUserNameWithEmail = (
  user?: Pick<
    BasicUserDetails,
    'preferredname' | 'lastname' | 'email' | 'firstname'
  > | null
): string =>
  user
    ? `${getPreferredName(user)} ${user.lastname} ${user.email ? `(${user.email})` : ''}`
    : 'None';

export const getFullUserNameWithInstitution = (
  user?: BasicUserData | null
): string =>
  user
    ? `${getPreferredName(user)} ${user.lastname}; ${user.institution ? `${user.institution}` : ''}`
    : 'None';

export const getFullUserNameWithBasicDetails = (
  user?: Pick<
    BasicUserDetails,
    | 'preferredname'
    | 'lastname'
    | 'email'
    | 'firstname'
    | 'institution'
    | 'country'
  > | null
): string =>
  user
    ? `${getPreferredName(user)} ${user.lastname} ${
        user.email ? `(${user.email})` : ''
      } ${user.institution ? `(${user.institution})` : ''} ${
        user.country ? `(${user.country})` : ''
      }`
    : 'None';
