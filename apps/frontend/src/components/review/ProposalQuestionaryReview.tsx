import { TableProps } from '@mui/material';
import React, { FunctionComponent, useContext } from 'react';

import UOLoader from 'components/common/UOLoader';
import ProposalQuestionaryDetails from 'components/proposal/ProposalQuestionaryDetails';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import UserList from 'components/user/UserList';
import UserListItem from 'components/user/UserListItem';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';

export default function ProposalQuestionaryReview(
  props: {
    data: ProposalWithQuestionary;
  } & TableProps<FunctionComponent<unknown>>
) {
  const { data, ...restProps } = props;
  const featureContext = useContext(FeatureContext);
  const isDataAccessUsersEnabled = featureContext.featuresMap.get(
    FeatureId.DATA_ACCESS_USERS
  )?.isEnabled;

  if (!data.questionaryId) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const users = data.users || [];

  const hasReferenceNumberFormat = !!data.call?.referenceNumberFormat;
  const additionalDetails: TableRowData[] = [
    {
      label: 'Proposal ID',
      value:
        !data.submitted && hasReferenceNumberFormat
          ? data.proposalId + ' (Pre-submission)'
          : data.proposalId,
    },
    { label: 'Title', value: data.title },
    { label: 'Abstract', value: data.abstract },
    {
      label: 'Principal Investigator',
      value: <UserListItem user={data.proposer} />,
    },
    {
      label: 'Co-Proposers',
      value: <UserList users={users} />,
    },
    ...(isDataAccessUsersEnabled && data.dataAccessUsers
      ? [
          {
            label: 'Data Access Users',
            value: <UserList users={data.dataAccessUsers} />,
          },
        ]
      : []),
    ...(data.coProposerInvites?.length > 0
      ? [
          {
            label: 'Invited',
            value: data.coProposerInvites
              .map((invite) => invite.email)
              .join(', '),
          },
        ]
      : []),
  ];

  return (
    <ProposalQuestionaryDetails
      questionaryId={data.questionaryId}
      questionaryData={data.questionary}
      additionalDetails={additionalDetails}
      title="Proposal information"
      proposalPk={data.primaryKey}
      {...restProps}
    />
  );
}
