import React from 'react';

import RoleBasedLink, {
  RoleBasedLinkProps,
} from 'components/common/RoleBasedLink';

type CommaSeparatedLink = {
  key: React.Key;
  label: React.ReactNode;
  roleRoutes: RoleBasedLinkProps['roleRoutes'];
};

export function fromArrayToCommaSeparatedLinks(
  links: CommaSeparatedLink[] | null | undefined
) {
  return (
    <>
      {links?.map((link, index) => (
        <React.Fragment key={link.key}>
          {index > 0 && ', '}
          <RoleBasedLink roleRoutes={link.roleRoutes}>
            {link.label}
          </RoleBasedLink>
        </React.Fragment>
      ))}
    </>
  );
}
