import { MenuItem, Typography } from '@mui/material';
import React from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { isValidEmail } from 'utils/net';
import { getFullUserNameWithInstitution } from 'utils/user';

interface NoOptionsTextProps {
  query: string;
  onAddEmail: (email: string) => void;
  onAddUser: (user: BasicUserDetails) => void;
  previousCollaborators: BasicUserDetails[];
  exactEmailMatch?: BasicUserDetails;
  excludeEmails?: string[];
  minSearchLength?: number;
}

function NoOptionsText({
  query,
  onAddEmail,
  onAddUser,
  previousCollaborators,
  exactEmailMatch,
  excludeEmails = [],
  minSearchLength = 3,
}: NoOptionsTextProps) {
  if (exactEmailMatch) {
    return (
      <MenuItem onClick={() => onAddUser(exactEmailMatch)}>
        {getFullUserNameWithInstitution(exactEmailMatch)}
      </MenuItem>
    );
  }

  if (!query) {
    return (
      <>
        {previousCollaborators.map((collaborator) => (
          <MenuItem
            key={collaborator.id}
            onClick={() => onAddUser(collaborator)}
          >
            {getFullUserNameWithInstitution(collaborator)}
          </MenuItem>
        ))}
      </>
    );
  }

  if ((query as string).length < minSearchLength) {
    return <>Please type at least {minSearchLength} characters</>;
  }

  if (isValidEmail(query)) {
    if (excludeEmails.includes(query)) {
      return <>{query} has already been invited</>;
    }

    return (
      <Typography
        sx={{ marginTop: 1, color: 'primary.main', cursor: 'pointer' }}
        onClick={() => onAddEmail(query)}
      >
        Invite {query} via email
      </Typography>
    );
  }

  if ((query as string).includes('@')) {
    return <>Keep typing a full email</>;
  }

  return (
    <>
      No results found for &quot;{query}&quot;. You can try typing their email.
    </>
  );
}

export default NoOptionsText;
