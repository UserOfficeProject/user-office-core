import { DialogActions, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, { useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import SampleDetails from 'components/experimentSafetyReview/SampleDetails';
import { Answer } from 'generated/sdk';
import { useSamplesWithQuestionaryStatus } from 'hooks/sample/useSamplesWithQuestionaryStatus';
import { SampleCore } from 'models/questionary/sample/SampleCore';

function SampleList(props: {
  samples: SampleCore[];
  onClick?: (sample: SampleCore) => void;
}) {
  const sampleLink = (sample: SampleCore) => (
    <Link href="#" onClick={() => props.onClick?.(sample)}>
      {sample.title}
    </Link>
  );

  return (
    <List
      sx={(theme) => ({
        padding: 0,
        margin: 0,
        '& li': {
          display: 'block',
          marginRight: theme.spacing(1),
        },
      })}
    >
      {props.samples.map((sample) => (
        <ListItem key={`sample-${sample.id}`}>{sampleLink(sample)}</ListItem>
      ))}
    </List>
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
      <StyledDialog
        maxWidth="lg"
        fullWidth
        open={selectedSampleId !== null}
        onClose={() => setSelectedSampleId(null)}
        title="Sample details"
      >
        <DialogContent>
          {selectedSampleId ? (
            <SampleDetails sampleId={selectedSampleId} />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setSelectedSampleId(null)}
            data-cy="close-sample-dialog"
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default SamplesAnswerRenderer;
