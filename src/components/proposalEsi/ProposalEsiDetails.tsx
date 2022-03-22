import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { useEsi } from 'hooks/esi/useEsi';

interface ProposalEsiDetailsProps {
  esiId: number;
}
const useStyles = makeStyles(() => ({
  sampleList: {
    listStyle: 'none',
    padding: 0,
  },
}));

function ProposalEsiDetails(props: ProposalEsiDetailsProps) {
  const { esi } = useEsi(props.esiId);
  const classes = useStyles();

  if (!esi) {
    return <UOLoader />;
  }

  const additionalDetails: TableRowData[] = [
    { label: 'Proposal ID', value: esi?.proposal.proposalId || '' },
    { label: 'Proposal Title', value: esi?.proposal.title || '' },
    {
      label: 'Samples for the experiment',
      value: (
        <ul className={classes.sampleList}>
          {esi.sampleEsis.map((esi) => (
            <li key={esi.sampleId}>{esi.sample.title}</li>
          ))}
        </ul>
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
