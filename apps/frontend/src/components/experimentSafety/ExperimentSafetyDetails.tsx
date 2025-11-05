import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import StyledDialog from 'components/common/StyledDialog';
import UOLoader from 'components/common/UOLoader';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { useExperimentSafety } from 'hooks/experimentSafety/useExperimentSafety';

interface ExperimentSafetyDetailsProps {
  experimentSafetyPk: number;
}

function ExperimentSampleLists({
  samples,
}: {
  samples: {
    sampleId: number;
    sample: { title: string };
    sampleEsiQuestionaryId: number;
  }[];
}) {
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);

  return (
    <>
      <List
        sx={{
          listStyle: 'none',
          padding: 0,
        }}
      >
        {samples.map((sample) => (
          <ListItem key={`sample-${sample.sampleId}`}>
            <Link
              to="#"
              onClick={() => setSelectedSampleId(sample.sampleId)}
              style={{ cursor: 'pointer' }}
            >
              {sample.sample.title || `Sample ${sample.sampleId}`}
            </Link>
          </ListItem>
        ))}
      </List>
      {/* Sample Details Modal */}
      <StyledDialog
        maxWidth="lg"
        fullWidth
        open={selectedSampleId !== null}
        onClose={() => setSelectedSampleId(null)}
        title={
          selectedSampleId
            ? (() => {
                const selectedSample = samples?.find(
                  (sample) => sample.sampleId === selectedSampleId
                );

                return `Sample Safety Input - ${
                  selectedSample?.sample.title || `Sample ${selectedSampleId}`
                }`;
              })()
            : 'Sample Safety Input'
        }
      >
        <DialogContent>
          {selectedSampleId
            ? (() => {
                const selectedSample = samples?.find(
                  (sample) => sample.sampleId === selectedSampleId
                );

                return selectedSample?.sampleEsiQuestionaryId ? (
                  <QuestionaryDetails
                    questionaryId={selectedSample.sampleEsiQuestionaryId}
                  />
                ) : (
                  <Box>No questionary found for this sample</Box>
                );
              })()
            : null}
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
    </>
  );
}

function ExperimentSafetyDetails(props: ExperimentSafetyDetailsProps) {
  const { experimentSafety } = useExperimentSafety(props.experimentSafetyPk);

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
      value: <ExperimentSampleLists samples={experimentSafety.samples} />,
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
