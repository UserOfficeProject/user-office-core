import React, { useContext } from 'react';

import UserManagementTable, {
  UserManagementTableProps,
} from 'components/common/UserManagementTable';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { BasicUserDetails } from 'generated/sdk';

import { ProposalContextType } from './ProposalContainer';

type CoProposersProps = Pick<
  UserManagementTableProps,
  'setInvites' | 'setUsers' | 'disabled'
> & {
  setPrincipalInvestigator?: (user: BasicUserDetails) => void;
};

const CoProposers = ({
  setPrincipalInvestigator,
  ...props
}: CoProposersProps) => {
  const handleUserAction = (action: string, user: BasicUserDetails) => {
    if (action === 'setPrincipalInvestigator' && setPrincipalInvestigator) {
      setPrincipalInvestigator(user);
    }
  };

  const { state } = useContext(QuestionaryContext) as ProposalContextType;
  if (!state) {
    throw new Error(createMissingContextErrorMessage());
  }
  const { proposer, users, coProposerInvites } = state.proposal;

  return (
    <UserManagementTable
      {...props}
      title="Co-Proposers"
      addButtonTooltip="Add a co-proposer"
      onUserAction={handleUserAction}
      excludeUserIds={proposer ? [proposer.id] : []}
      // QuickFix for material table changing immutable state
      // https://github.com/mbrn/material-table/issues/666
      users={JSON.parse(JSON.stringify(users))}
      invites={coProposerInvites}
    />
  );
};

export default CoProposers;
