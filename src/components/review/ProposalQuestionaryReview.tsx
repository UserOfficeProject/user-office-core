import { TableProps } from '@material-ui/core';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { ProposalSubsetSubmission } from 'models/ProposalSubmissionState';

export default function ProposalQuestionaryReview(
  props: {
    data: ProposalSubsetSubmission;
  } & TableProps<any>
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
        .map((user: any) => `${user.firstname} ${user.lastname}`)
        .join(', '),
    },
  ];

  return (
    <QuestionaryDetails
      questionaryId={data.questionaryId}
      additionalDetails={additionalDetails}
      title="Proposal information"
      {...restProps}
    />
  );
}
