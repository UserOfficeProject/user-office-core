import React, { useContext } from 'react';
import { Link, LinkProps, To } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';

export type RoleBasedLinkProps = Omit<LinkProps, 'to'> & {
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

  // With a destination for this role, render a link; otherwise render
  // children as plain content with no link behavior.
  return to !== undefined ? (
    <Link to={to} {...linkProps}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
};

export default RoleBasedLink;
