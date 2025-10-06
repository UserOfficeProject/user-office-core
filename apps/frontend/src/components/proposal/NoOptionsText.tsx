import { MenuItem, Typography } from '@mui/material';
import React from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { isValidEmail } from 'utils/net';
import { getFullUserNameWithInstitution } from 'utils/user';

interface NoOptionsTextProps {
  query: string;
  onAddEmail: (email: string) => void;
  onAddUser: (user: BasicUserDetails) => void;
  exactEmailMatch?: BasicUserDetails;
  excludeEmails?: string[];
  minSearchLength?: number;
  isEmailSearchOnly: boolean;
  allowInviteByEmail?: boolean;
}

function NoOptionsText({
  query,
  onAddEmail,
  onAddUser,
  exactEmailMatch,
  excludeEmails = [],
  minSearchLength = 3,
  isEmailSearchOnly,
  allowInviteByEmail = false,
}: NoOptionsTextProps) {
  const isEmailInviteEnabled = allowInviteByEmail;

  if (exactEmailMatch) {
    return (
      <MenuItem onClick={() => onAddUser(exactEmailMatch)}>
        {getFullUserNameWithInstitution(exactEmailMatch)}
      </MenuItem>
    );
  }

  if (isEmailSearchOnly) {
    if (isValidEmail(query)) {
      return <>No results found for &quot;{query}&quot;</>;
    } else {
      return <>Enter a full email address</>;
    }
  }

  if ((query as string).length < minSearchLength) {
    return <>Please type at least {minSearchLength} characters</>;
  }

  if (isValidEmail(query)) {
    if (excludeEmails.includes(query.toLowerCase())) {
      return <>{query} has already been invited</>;
    }

    if (isEmailInviteEnabled) {
      return (
        <Typography
          sx={{ marginTop: 1, color: 'primary.main', cursor: 'pointer' }}
          onClick={() => onAddEmail(query)}
        >
          Invite {query} via email
        </Typography>
      );
    } else {
      return <>No results found for &quot;{query}&quot;</>;
    }
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
