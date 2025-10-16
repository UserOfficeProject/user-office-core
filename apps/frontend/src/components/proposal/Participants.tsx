import React, { useContext } from 'react';

import UserManagementTable, {
  UserManagementTableProps,
} from 'components/common/UserManagementTable';
import { FeatureContext } from 'context/FeatureContextProvider';
import { BasicUserDetails, FeatureId } from 'generated/sdk';
import { BasicUserData } from 'hooks/user/useUserData';

type ProposalParticipantsProps = Omit<
  UserManagementTableProps,
  'onUserAction' | 'excludeUserIds' | 'disabled'
> & {
  principalInvestigator?: BasicUserData | null;
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
  loadingPrincipalInvestigator?: boolean;
};

const ProposalParticipants = ({
  principalInvestigator,
  setPrincipalInvestigator,
  loadingPrincipalInvestigator,
  ...props
}: ProposalParticipantsProps) => {
  const handleUserAction = (action: string, user: BasicUserDetails) => {
    if (action === 'setPrincipalInvestigator' && setPrincipalInvestigator) {
      setPrincipalInvestigator(user);
    }
  };

  const featureContext = useContext(FeatureContext);
  const allowInviteByEmail = !!featureContext.featuresMap.get(
    FeatureId.EMAIL_INVITE
  )?.isEnabled;

  return (
    <UserManagementTable
      {...props}
      disabled={loadingPrincipalInvestigator}
      onUserAction={setPrincipalInvestigator ? handleUserAction : undefined}
      excludeUserIds={principalInvestigator ? [principalInvestigator.id] : []}
      allowInviteByEmail={allowInviteByEmail}
    />
  );
};

export default ProposalParticipants;
