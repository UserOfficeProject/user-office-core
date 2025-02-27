import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { useExperimentSafety } from 'hooks/experimentSafety/useExperimentSafety';

interface ExperimentSafetyDetailsProps {
  esiId: number;
}

function ExperimentSafetyDetails(props: ExperimentSafetyDetailsProps) {
  const { experimentSafety } = useExperimentSafety(props.esiId);

  if (!experimentSafety) {
    return <UOLoader />;
  }

  const additionalDetails: TableRowData[] = [
    {
      label: 'Proposal ID',
      value: experimentSafety?.proposal.proposalId || '',
    },
    { label: 'Proposal Title', value: experimentSafety?.proposal.title || '' },
    {
      label: 'Samples for the experiment',
      value: (
        <List
          sx={{
            listStyle: 'none',
            padding: 0,
          }}
        >
          {experimentSafety.samples.map((sample) => (
            <ListItem key={sample.sampleId}>{sample.sample.title}</ListItem>
          ))}
        </List>
      ),
    },
  ];

  return (
    <QuestionaryDetails
      questionaryId={experimentSafety.questionary.questionaryId}
      additionalDetails={additionalDetails}
      title="Experiment safety input"
    />
  );
}

export default ExperimentSafetyDetails;
