import React from 'react';

import UOLoader from 'components/common/UOLoader';
import ProposalQuestionaryDetails from 'components/proposal/ProposalQuestionaryDetails';
import { TableRowData } from 'components/questionary/QuestionaryDetails';
import { BasicUserDetails } from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { getFullUserNameWithEmail } from 'utils/user';

interface ProposalQuestionaryReviewProps {
  proposalPk: number;
}

export default function ProposalQuestionaryReview(
  props: ProposalQuestionaryReviewProps
) {
  const { proposalPk, ...restProps } = props;
  const { proposalData } = useProposalData(proposalPk);

  if (!proposalData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const users = proposalData.users || [];

  const hasReferenceNumberFormat = !!proposalData.call?.referenceNumberFormat;
  const additionalDetails: TableRowData[] = [
    {
      label: 'Proposal ID',
      value:
        !proposalData.submitted && hasReferenceNumberFormat
          ? proposalData.proposalId + ' (Pre-submission)'
          : proposalData.proposalId,
    },
    { label: 'Title', value: proposalData.title },
    { label: 'Abstract', value: proposalData.abstract },
    {
      label: 'Instrument',
      value: proposalData.instrument?.shortCode ?? 'None',
    },
    {
      label: 'Principal Investigator',
      value: getFullUserNameWithEmail(proposalData.proposer),
    },
    {
      label: 'Co-Proposers',
      value: users
        .map((user: BasicUserDetails) => getFullUserNameWithEmail(user))
        .join(', '),
    },
  ];

  return (
    <ProposalQuestionaryDetails
      questionaryId={proposalData.questionary.questionaryId}
      additionalDetails={additionalDetails}
      title="Proposal information"
      proposalPk={proposalData.primaryKey}
      {...restProps}
    />
  );
}
