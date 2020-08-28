import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { MTableToolbar, Options } from 'material-table';
import React, { useEffect, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import SelectedCallFilter from 'components/common/SelectedCallFilter';
import { Sample, SampleStatus } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { SampleBasic } from 'models/Sample';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import SampleDetails from './SampleDetails';
import SamplesTable from './SamplesTable';

function SampleSafetyPage() {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { callsData, loadingCalls } = useCallsData({ isActive: true });

  const [selectedCallId, setSelectedCallId] = useState<number>(0);
  const [samples, setSamples] = useState<SampleBasic[]>([]);
  const [selectedSample, setSelecedSample] = useState<Sample | null>(null);

  useEffect(() => {
    if (selectedCallId === null) {
      return;
    }

    if (selectedCallId === 0) {
      api()
        .getSamples()
        .then(result => {
          setSamples(result.samples || []);
        });
    } else {
      api()
        .getSamplesByCallId({ callId: selectedCallId })
        .then(result => {
          setSamples(result.samplesByCallId || []);
        });
    }
  }, [api, selectedCallId]);

  const handleStatusUpdate = (status: SampleStatus) => {
    setSelecedSample(null);

    api(`Status for '${selectedSample?.title}' has been set to ${status}`)
      .updateSampleStatus({
        sampleId: selectedSample!.id,
        status: status,
      })
      .then(result => {
        const newSample = result.updateSampleStatus.sample;

        if (newSample) {
          const newSamples = samples.map(sample =>
            sample.id === newSample.id ? newSample : sample
          );

          setSamples(newSamples);
        }
      });
  };

  const handleAccept = () => {
    handleStatusUpdate(SampleStatus.SAFE);
  };

  const handleReject = () => {
    handleStatusUpdate(SampleStatus.UNSAFE);
  };

  const Toolbar = (data: Options): JSX.Element =>
    loadingCalls ? (
      <div>Loading...</div>
    ) : (
      <>
        <MTableToolbar {...data} />
        <SelectedCallFilter
          callId={selectedCallId}
          callsData={callsData || []}
          onChange={callId => {
            setSelectedCallId(callId);
          }}
          shouldShowAll={true}
        />
      </>
    );

  return (
    <>
      {isExecutingCall && loadingCalls ? <LinearProgress /> : null}
      <Container maxWidth="lg">
        <SamplesTable
          components={{ Toolbar }}
          data={samples}
          actions={[
            {
              icon: VisibilityIcon,
              tooltip: 'Review sample',
              onClick: (event, rowData) => setSelecedSample(rowData as Sample),
            },
          ]}
        />
      </Container>
      <InputDialog
        open={selectedSample !== null}
        onClose={() => setSelecedSample(null)}
        fullWidth={true}
      >
        {selectedSample ? <SampleDetails sampleId={selectedSample.id} /> : null}
        <ActionButtonContainer>
          <Button variant="contained" onClick={handleReject} color="secondary">
            Reject
          </Button>
          <Button variant="contained" onClick={handleAccept} color="primary">
            Accept
          </Button>
        </ActionButtonContainer>
      </InputDialog>
    </>
  );
}

export default SampleSafetyPage;
