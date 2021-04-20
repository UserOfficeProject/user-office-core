import { TableProps } from '@material-ui/core';
import React, { FunctionComponent } from 'react';

import UOLoader from 'components/common/UOLoader';
import ProposalQuestionaryDetails from 'components/proposal/ProposalQuestionaryDetails';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import { BasicUserDetails } from 'generated/sdk';
import { ProposalSubsetSubmission } from 'models/ProposalSubmissionState';

export default function ProposalQuestionaryReview(
  props: {
    data: ProposalSubsetSubmission;
  } & TableProps<FunctionComponent<unknown>>
) {
  const { data, ...restProps } = props;

  if (!data.questionaryId) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const users = data.users || [];

  const additionalDetails: TableRowData[] = [
    { label: 'Proposal ID', value: data.shortCode },
    { label: 'Title', value: data.title },
    { label: 'Abstract', value: data.abstract },
    {
      label: 'Principal Investigator',
      value: `${data.proposer?.firstname} ${data.proposer?.lastname}`,
    },
    {
      label: 'Co-Proposers',
      value: users
        .map((user: BasicUserDetails) => `${user.firstname} ${user.lastname}`)
        .join(', '),
    },
  ];

  return (
    <ProposalQuestionaryDetails
      questionaryId={data.questionaryId}
      additionalDetails={additionalDetails}
      title="Proposal information"
      proposalId={data.id}
      {...restProps}
    />
  );
}
