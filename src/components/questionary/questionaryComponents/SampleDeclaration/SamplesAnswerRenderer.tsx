import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import SampleDetails from 'components/sample/SampleDetails';
import { Answer } from 'generated/sdk';
import { useSamplesWithQuestionaryStatus } from 'hooks/sample/useSamplesWithQuestionaryStatus';
import { SampleWithQuestionaryStatus } from 'models/Sample';

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
  samples: SampleWithQuestionaryStatus[];
  onClick?: (sample: SampleWithQuestionaryStatus) => void;
}) {
  const classes = useStyles();

  const sampleLink = (sample: SampleWithQuestionaryStatus) => (
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

interface SamplesAnswerRendererProps {
  proposalPk: number;
  answer: Answer;
}

const SamplesAnswerRenderer = ({
  proposalPk,
  answer,
}: SamplesAnswerRendererProps) => {
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);

  const { samples } = useSamplesWithQuestionaryStatus({
    proposalPk: proposalPk,
    questionId: answer.question.id,
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
