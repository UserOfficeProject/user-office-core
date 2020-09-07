import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
import React, { useEffect, useState } from 'react';
import { useQueryParams, NumberParam, StringParam } from 'use-query-params';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import SelectedCallFilter from 'components/common/SelectedCallFilter';
import { Sample, SampleStatus } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { SampleBasic } from 'models/Sample';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import SampleDetails from './SampleDetails';
import SamplesTable from './SamplesTable';

function SampleSafetyPage() {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { calls, loadingCalls } = useCallsData({ isActive: true });
  const [urlQueryParams, setUrlQueryParams] = useQueryParams({
    call: NumberParam,
    search: StringParam,
  });

  const [selectedCallId, setSelectedCallId] = useState<number>(
    urlQueryParams.call ? urlQueryParams.call : 0
  );
  const [samples, setSamples] = useState<SampleBasic[]>([]);
  const [loadingSamples, setLoadingSamples] = useState<boolean>(true);
  const [selectedSample, setSelecedSample] = useState<Sample | null>(null);

  useEffect(() => {
    if (selectedCallId === null) {
      return;
    }

    if (selectedCallId === 0) {
      setLoadingSamples(true);
      api()
        .getSamples()
        .then(result => {
          setSamples(result.samples || []);
          setLoadingSamples(false);
        });
    } else {
      api()
        .getSamplesByCallId({ callId: selectedCallId })
        .then(result => {
          setSamples(result.samplesByCallId || []);
          setLoadingSamples(false);
        });
    }
  }, [api, selectedCallId]);

  const handleStatusUpdate = (status: SampleStatus) => {
    setSelecedSample(null);

    setLoadingSamples(true);
    api(`Status for '${selectedSample?.title}' has been set to ${status}`)
      .updateSampleStatus({
        sampleId: (selectedSample as Sample).id,
        status: status,
      })
      .then(result => {
        const newSample = result.updateSampleStatus.sample;

        if (newSample) {
          const newSamples = samples.map(sample =>
            sample.id === newSample.id ? newSample : sample
          );

          setSamples(newSamples);
          setLoadingSamples(false);
        }
      });
  };

  const handleAccept = () => {
    handleStatusUpdate(SampleStatus.SAFE);
  };

  const handleReject = () => {
    handleStatusUpdate(SampleStatus.UNSAFE);
  };

  const Toolbar = (): JSX.Element =>
    loadingCalls ? (
      <div>Loading filter...</div>
    ) : (
      <>
        <SelectedCallFilter
          callId={selectedCallId}
          callsData={calls}
          onChange={callId => {
            setSelectedCallId(callId);
          }}
          shouldShowAll={true}
        />
      </>
    );

  return (
    <>
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <Toolbar />
              <SamplesTable
                data={samples}
                isLoading={isExecutingCall || loadingSamples}
                actions={[
                  {
                    icon: VisibilityIcon,
                    tooltip: 'Review sample',
                    onClick: (event, rowData) =>
                      setSelecedSample(rowData as Sample),
                  },
                ]}
                urlQueryParams={urlQueryParams}
                setUrlQueryParams={setUrlQueryParams}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
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
