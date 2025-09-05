import React from 'react';

import UserManagementTable, {
  UserManagementTableProps,
} from 'components/common/UserManagementTable';
import { BasicUserDetails } from 'generated/sdk';
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

  return (
    <UserManagementTable
      {...props}
      addButtonTooltip="Add a co-proposer"
      disabled={loadingPrincipalInvestigator}
      onUserAction={setPrincipalInvestigator ? handleUserAction : undefined}
      excludeUserIds={principalInvestigator ? [principalInvestigator.id] : []}
    />
  );
};

export default ProposalParticipants;
