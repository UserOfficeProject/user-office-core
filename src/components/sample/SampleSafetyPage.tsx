import { Avatar, ListItemIcon, MenuItem, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { Options } from 'material-table';
import React, { useEffect, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
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
              .updateSample({ sampleId: id, safetyComment, safetyStatus })
              .then(result => {
                const newSample = result.updateSample.sample;
                onClose(newSample || null);
              });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field
              type="text"
              name="safetyStatus"
              label="Status"
              select
              margin="normal"
              component={TextField}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{ 'data-cy': 'safety-status' }}
              fullWidth
              required={true}
              disabled={isSubmitting}
            >
              <MenuItem
                key={SampleStatus.PENDING_EVALUTATION}
                value={SampleStatus.PENDING_EVALUTATION}
              >
                <ListItemIcon>
                  <Avatar style={{ backgroundColor: '#CCC' }}>&nbsp;</Avatar>
                </ListItemIcon>
                <Typography variant="inherit">Not evaluated</Typography>
              </MenuItem>

              <MenuItem
                key={SampleStatus.LOW_RISK}
                value={SampleStatus.LOW_RISK}
              >
                <ListItemIcon>
                  <Avatar style={{ backgroundColor: '#88C100' }}>&nbsp;</Avatar>
                </ListItemIcon>
                <Typography variant="inherit">Low risk</Typography>
              </MenuItem>

              <MenuItem
                key={SampleStatus.ELEVATED_RISK}
                value={SampleStatus.ELEVATED_RISK}
              >
                <ListItemIcon>
                  <Avatar style={{ backgroundColor: '#FF8A00' }}>&nbsp;</Avatar>
                </ListItemIcon>
                <Typography variant="inherit">Elevated risk</Typography>
              </MenuItem>

              <MenuItem
                key={SampleStatus.HIGH_RISK}
                value={SampleStatus.HIGH_RISK}
              >
                <ListItemIcon>
                  <Avatar style={{ backgroundColor: '#FF003C' }}>&nbsp;</Avatar>
                </ListItemIcon>
                <Typography variant="inherit">High risk</Typography>
              </MenuItem>
            </Field>

            <Field
              name="safetyComment"
              id="safetyComment"
              label="Comment"
              type="text"
              component={TextField}
              multiline
              fullWidth
              disabled={isSubmitting}
              InputProps={{ rows: 4, rowsMax: 10, 'data-cy': 'safety-comment' }}
            />

            <ActionButtonContainer>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                data-cy="submit"
              >
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
