import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React, { useEffect, useState } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import CallFilter from 'components/common/proposalFilters/CallFilter';
import { Maybe, SampleStatus } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useDownloadPDFSample } from 'hooks/sample/useDownloadPDFSample';
import { SampleWithProposalData } from 'models/questionary/sample/SampleWithProposalData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import SampleDetails from './SampleDetails';
import SamplesTable from './SamplesTable';

function SampleEvaluationDialog(props: {
  sample: SampleWithProposalData;
  onClose: (sample: Maybe<SampleWithProposalData>) => void;
}) {
  const { sample, onClose } = props;
  const { api } = useDataApiWithFeedback();

  const initialValues: SampleWithProposalData = {
    ...sample,
  };

  return (
    <InputDialog
      open={sample !== null}
      onClose={() => onClose(null)}
      fullWidth={true}
    >
      <SampleDetails sampleId={sample.id} />
      <Formik
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          if (!values) {
            return;
          }

          const { id, safetyComment, safetyStatus } = values;
          const result = await api({
            toastSuccessMessage: `Review for '${sample?.title}' submitted`,
          }).updateSample({ sampleId: id, safetyComment, safetyStatus });

          const updatedSample = result.updateSample.sample;
          onClose({ ...values, ...updatedSample } || null);
        }}
      >
        {({ isSubmitting, dirty }) => (
          <Form>
            <Field
              type="text"
              name="safetyStatus"
              label="Status"
              select
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
                key={SampleStatus.PENDING_EVALUATION}
                value={SampleStatus.PENDING_EVALUATION}
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
              InputProps={{
                minRows: 4,
                maxRows: 10,
                'data-cy': 'safety-comment',
              }}
            />

            <ActionButtonContainer>
              <Button type="submit" data-cy="submit" disabled={!dirty}>
                Submit
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </InputDialog>
  );
}

const columns = [
  {
    title: 'Actions',
    sorting: false,
    removable: false,
    field: 'rowActions',
  },
  {
    title: 'Proposal ID',
    field: 'proposal.proposalId',
  },
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'safetyStatus' },
  { title: 'Created', field: 'created' },
];

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
  const [samples, setSamples] = useState<SampleWithProposalData[]>([]);
  const [selectedSample, setSelectedSample] =
    useState<SampleWithProposalData | null>(null);

  useEffect(() => {
    if (selectedCallId === null) {
      return;
    }

    if (selectedCallId === 0) {
      api()
        .getSamplesWithProposalData()
        .then((result) => {
          setSamples(result.samples || []);
        });
    } else {
      api()
        .getSamplesByCallId({ callId: selectedCallId })
        .then((result) => {
          setSamples(result.samplesByCallId || []);
        });
    }
  }, [api, selectedCallId]);

  const downloadPDFSample = useDownloadPDFSample();
  const RowActionButtons = (rowData: SampleWithProposalData) => (
    <>
      <Tooltip title="Review sample">
        <IconButton onClick={() => setSelectedSample(rowData)}>
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download sample as pdf">
        <IconButton
          data-cy="download-sample"
          onClick={() => downloadPDFSample([rowData.id], rowData.title)}
        >
          <GetAppIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  const samplesWithRowActions = samples.map((sample) => ({
    ...sample,
    rowActions: RowActionButtons(sample),
  }));

  return (
    <>
      {selectedSample && (
        <SampleEvaluationDialog
          sample={selectedSample}
          onClose={(newSample) => {
            if (newSample) {
              const newSamples = samples.map((sample) =>
                sample.id === newSample.id ? newSample : sample
              );

              setSamples(newSamples);
            }
            setSelectedSample(null);
          }}
        />
      )}
      <StyledContainer>
        <StyledPaper>
          <CallFilter
            callId={selectedCallId}
            calls={calls}
            isLoading={loadingCalls}
            onChange={(callId) => {
              setSelectedCallId(callId);
            }}
            shouldShowAll={true}
          />
          <SamplesTable
            data={samplesWithRowActions}
            isLoading={isExecutingCall}
            urlQueryParams={urlQueryParams}
            setUrlQueryParams={setUrlQueryParams}
            columns={columns}
            options={{
              selection: true,
              headerSelectionProps: {
                inputProps: { 'aria-label': 'Select All Rows' },
              },
            }}
            actions={[
              {
                icon: GetAppIcon,
                tooltip: 'Download sample',
                onClick: (event, rowData) =>
                  downloadPDFSample(
                    (rowData as SampleWithProposalData[]).map(({ id }) => id),
                    (rowData as SampleWithProposalData[])[0].title
                  ),
              },
            ]}
          />
        </StyledPaper>
      </StyledContainer>
    </>
  );
}

export default SampleSafetyPage;
