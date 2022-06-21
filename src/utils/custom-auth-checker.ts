import { AuthChecker } from 'type-graphql';

import { ResolverContext } from '../context';

export const customAuthChecker: AuthChecker<ResolverContext> = (
  { context },
  roles
) => {
  const { isApiAccessToken, currentRole } = context.user || {};

  // There is no check for attributes for AccessTokens, so just let through
  return isApiAccessToken ||
    (currentRole && roles.includes(currentRole.shortCode))
    ? true
    : false;
};
