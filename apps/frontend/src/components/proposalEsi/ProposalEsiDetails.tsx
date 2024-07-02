import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { useEsi } from 'hooks/esi/useEsi';

interface ProposalEsiDetailsProps {
  esiId: number;
}

function ProposalEsiDetails(props: ProposalEsiDetailsProps) {
  const { esi } = useEsi(props.esiId);

  if (!esi) {
    return <UOLoader />;
  }

  const additionalDetails: TableRowData[] = [
    { label: 'Proposal ID', value: esi?.proposal.proposalId || '' },
    { label: 'Proposal Title', value: esi?.proposal.title || '' },
    {
      label: 'Samples for the experiment',
      value: (
        <List
          sx={{
            listStyle: 'none',
            padding: 0,
          }}
        >
          {esi.sampleEsis.map((esi) => (
            <ListItem key={esi.sampleId}>{esi.sample.title}</ListItem>
          ))}
        </List>
      ),
    },
  ];

  return (
    <QuestionaryDetails
      questionaryId={esi.questionary.questionaryId}
      additionalDetails={additionalDetails}
      title="Experiment safety input"
    />
  );
}

export default ProposalEsiDetails;
