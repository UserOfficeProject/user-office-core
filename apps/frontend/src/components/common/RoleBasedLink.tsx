import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import React, { useContext } from 'react';
import { Link as RouterLink, To } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';

export type RoleBasedLinkProps = Omit<MuiLinkProps, 'href' | 'component'> & {
  /** Map of role -> destination. Roles omitted here render children as-is without a link. */
  roleRoutes: Partial<Record<UserRole, To>>;
};

const RoleBasedLink = ({
  roleRoutes,
  children,
  ...linkProps
}: RoleBasedLinkProps) => {
  const { currentRole } = useContext(UserContext);

  const to: To | undefined = currentRole ? roleRoutes[currentRole] : undefined;

  // With a destination for this role, render an MUI-styled link that navigates
  // via react-router (client-side); otherwise render children as plain content
  // with no link behavior.
  return to !== undefined ? (
    <MuiLink component={RouterLink} to={to} {...linkProps}>
      {children}
    </MuiLink>
  ) : (
    <>{children}</>
  );
};

export default RoleBasedLink;
