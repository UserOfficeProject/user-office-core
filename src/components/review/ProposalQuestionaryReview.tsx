import { TableProps } from '@mui/material';
import React, { FunctionComponent } from 'react';

import UOLoader from 'components/common/UOLoader';
import ProposalQuestionaryDetails from 'components/proposal/ProposalQuestionaryDetails';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import { BasicUserDetails } from 'generated/sdk';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';
import { getFullUserName } from 'utils/user';

export default function ProposalQuestionaryReview(
  props: {
    data: ProposalWithQuestionary;
  } & TableProps<FunctionComponent<unknown>>
) {
  const { data, ...restProps } = props;

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
      value: getFullUserName(data.proposer),
    },
    {
      label: 'Co-Proposers',
      value: users
        .map((user: BasicUserDetails) => getFullUserName(user))
        .join(', '),
    },
  ];

  return (
    <ProposalQuestionaryDetails
      questionaryId={data.questionaryId}
      additionalDetails={additionalDetails}
      title="Proposal information"
      proposalPk={data.primaryKey}
      {...restProps}
    />
  );
}
