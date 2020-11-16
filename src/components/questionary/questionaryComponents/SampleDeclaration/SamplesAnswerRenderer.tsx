import { Button, Link, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import SampleDetails from 'components/sample/SampleDetails';
import { Answer } from 'generated/sdk';
import { useSamples } from 'hooks/sample/useSamples';
import { SampleBasic } from 'models/Sample';

const useStyles = makeStyles(theme => ({
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
  sampleIds: number[];
  onClick?: (sample: SampleBasic) => any;
}) {
  const { sampleIds } = props;

  const classes = useStyles();
  const { samples } = useSamples({ sampleIds });

  const sampleLink = (sample: SampleBasic) => (
    <Link href="#" onClick={() => props.onClick?.(sample)}>
      {sample.title}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {samples.map(sample => (
        <li key={`sample-${sample.id}`}>{sampleLink(sample)}</li>
      ))}
    </ul>
  );
}

function SamplesAnswerRenderer(props: { answer: Answer }) {
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);

  return (
    <div>
      <SampleList
        sampleIds={props.answer.value}
        onClick={sample => setSelectedSampleId(sample.id)}
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
}

export default SamplesAnswerRenderer;
