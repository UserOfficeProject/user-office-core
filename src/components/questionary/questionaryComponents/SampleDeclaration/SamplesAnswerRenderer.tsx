import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useContext, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import { ProposalContextType } from 'components/proposal/ProposalContainer';
import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
import SampleDetails from 'components/sample/SampleDetails';
import { useSamples } from 'hooks/sample/useSamples';
import { SampleBasic } from 'models/Sample';

const useStyles = makeStyles((theme) => ({
  list: {
    padding: 0,
    margin: 0,
    '& li': {
      display: 'block',
      marginRight: theme.spacing(1),
    },
  },
}));

function SampleList(props: {
  samples: SampleBasic[];
  onClick?: (sample: SampleBasic) => void;
}) {
  const classes = useStyles();

  const sampleLink = (sample: SampleBasic) => (
    <Link href="#" onClick={() => props.onClick?.(sample)}>
      {sample.title}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {props.samples.map((sample) => (
        <li key={`sample-${sample.id}`}>{sampleLink(sample)}</li>
      ))}
    </ul>
  );
}

const SamplesAnswerRenderer: AnswerRenderer = ({ question }) => {
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const { state } = useContext(QuestionaryContext) as ProposalContextType;

  const { samples } = useSamples({
    proposalId: state?.proposal.id,
    questionId: question.id,
  });

  return (
    <div>
      <SampleList
        samples={samples}
        onClick={(sample) => setSelectedSampleId(sample.id)}
      />
      <InputDialog
        maxWidth="sm"
        open={selectedSampleId !== null}
        onClose={() => setSelectedSampleId(null)}
      >
        {selectedSampleId ? (
          <SampleDetails sampleId={selectedSampleId} />
        ) : null}
        <ActionButtonContainer>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setSelectedSampleId(null)}
            data-cy="close-sample-dialog"
          >
            Close
          </Button>
        </ActionButtonContainer>
      </InputDialog>
    </div>
  );
};

export default SamplesAnswerRenderer;
