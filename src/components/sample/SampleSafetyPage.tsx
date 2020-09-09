import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { Options } from 'material-table';
import React, { useEffect, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import FormikDropdown from 'components/common/FormikDropdown';
import InputDialog from 'components/common/InputDialog';
import SelectedCallFilter from 'components/common/SelectedCallFilter';
import { Maybe, Sample, SampleStatus } from 'generated/sdk';
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

  const Toolbar = (data: Options): JSX.Element =>
    loadingCalls ? (
      <div>Loading...</div>
    ) : (
      <>
        <SelectedCallFilter
          callId={selectedCallId}
          callsData={calls || []}
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
                isLoading={isExecutingCall}
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
      <SampleEvaluationDialog
        sample={selectedSample}
        onClose={newSample => {
          if (newSample) {
            const newSamples = samples.map(sample =>
              sample.id === newSample.id ? newSample : sample
            );

            setSamples(newSamples);
          }
          setSelecedSample(null);
        }}
      />
    </>
  );
}

function SampleEvaluationDialog(props: {
  sample: Maybe<Sample>;
  onClose: (sample: Maybe<SampleBasic>) => any;
}) {
  const { sample, onClose } = props;
  const { api } = useDataApiWithFeedback();

  return (
    <InputDialog
      open={sample !== null}
      onClose={() => onClose(null)}
      fullWidth={true}
    >
      {sample ? <SampleDetails sampleId={sample.id} /> : null}
      <Formik
        initialValues={sample}
        onSubmit={async (values, actions) => {
          if (values) {
            const { id, safetyComment, safetyStatus } = values;
            api(`Review for '${sample?.title}' submitted`)
              .updateSampleSafetyReview({ id, safetyComment, safetyStatus })
              .then(result => {
                const newSample = result.updateSampleSafetyReview.sample;
                onClose(newSample || null);
              });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormikDropdown
              name="safetyStatus"
              label="Status"
              items={[
                { text: 'Safe', value: SampleStatus.SAFE },
                { text: 'Unsafe', value: SampleStatus.UNSAFE },
              ]}
              data-cy="safetyStatus"
              disabled={isSubmitting}
            />

            <Field
              name="safetyComment"
              id="safetyComment"
              label="Comment"
              type="text"
              component={TextField}
              multiline
              data-cy="safetyComment"
              fullWidth
              disabled={isSubmitting}
              InputProps={{ rows: 4, rowsMax: 10 }}
            />
            <ActionButtonContainer>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </InputDialog>
  );
}

export default SampleSafetyPage;
