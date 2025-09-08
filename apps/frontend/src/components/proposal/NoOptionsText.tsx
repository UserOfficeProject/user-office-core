import { MenuItem, Typography } from '@mui/material';
import React, { useContext } from 'react';

import { FeatureContext } from 'context/FeatureContextProvider';
import { BasicUserDetails, FeatureId } from 'generated/sdk';
import { isValidEmail } from 'utils/net';
import { getFullUserNameWithInstitution } from 'utils/user';

interface NoOptionsTextProps {
  query: string;
  onAddEmail: (email: string) => void;
  onAddUser: (user: BasicUserDetails) => void;
  exactEmailMatch?: BasicUserDetails;
  excludeEmails?: string[];
  minSearchLength?: number;
  enableEmailInvites?: boolean;
}

function NoOptionsText({
  query,
  onAddEmail,
  onAddUser,
  exactEmailMatch,
  excludeEmails = [],
  minSearchLength = 3,
  enableEmailInvites,
}: NoOptionsTextProps) {
  const featureContext = useContext(FeatureContext);
  const isEmailInviteFeatureEnabled = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;

  // email invite will be enabled if both the prop and the feature flag are true
  const isEmailInviteEnabled =
    enableEmailInvites && isEmailInviteFeatureEnabled;

  if (exactEmailMatch) {
    return (
      <MenuItem onClick={() => onAddUser(exactEmailMatch)}>
        {getFullUserNameWithInstitution(exactEmailMatch)}
      </MenuItem>
    );
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
