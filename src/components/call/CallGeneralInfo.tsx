import HelpIcon from '@mui/icons-material/Help';
import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Field, useFormikContext } from 'formik';
import { TextField } from 'formik-mui';
import { DateTimePicker } from 'formik-mui-lab';
import React, { useContext } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  AllocationTimeUnits,
  CreateCallMutationVariables,
  FeatureId,
  GetTemplatesQuery,
  ProposalWorkflow,
  UpdateCallMutationVariables,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

const CallGeneralInfo: React.FC<{
  templates: GetTemplatesQuery['templates'];
  esiTemplates: GetTemplatesQuery['templates'];
  loadingTemplates: boolean;
  proposalWorkflows: ProposalWorkflow[];
  loadingProposalWorkflows: boolean;
}> = ({
  loadingProposalWorkflows,
  proposalWorkflows,
  templates,
  esiTemplates,
  loadingTemplates,
}) => {
  const { featuresMap } = useContext(FeatureContext);
  const { format: dateTimeFormat, mask, timezone } = useFormattedDateTime();

  const theme = useTheme();

  const templateOptions =
    templates?.map((template) => ({
      text: template.name,
      value: template.templateId,
    })) || [];

  const esiTemplateOptions =
    esiTemplates?.map((template) => ({
      text: template.name,
      value: template.templateId,
    })) || [];

  const proposalWorkflowOptions =
    proposalWorkflows.map((proposalWorkflow) => ({
      text: proposalWorkflow.name,
      value: proposalWorkflow.id,
    })) || [];

  const allocationTimeUnitOptions = Object.values(AllocationTimeUnits).map(
    (key) => ({
      text: key,
      value: key,
    })
  );

  const formik = useFormikContext<
    CreateCallMutationVariables | UpdateCallMutationVariables
  >();
  const { startCall } = formik.values;

  function validateRefNumFormat(input: string) {
    let errorMessage;
    const regExp = /^[a-z|\d]+{digits:[1-9]+}$/;
    const prefixRegex = /[a-z|\d]+{/;
    const parameterRegex = /{digits:[1-9]+}/;

    if (input && !input.match(regExp)) {
      if (!input.match(prefixRegex)) {
        errorMessage = 'Invalid prefix.';
      } else if (!input.match(parameterRegex)) {
        errorMessage = 'Invalid parameter.';
      } else {
        errorMessage = 'Invalid format.';
      }
    }

    return errorMessage;
  }

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
      head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
      },
      body: {
        fontSize: 14,
      },
    })
  )(TableCell);

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    })
  )(TableRow);

  function populateTable(format: string, refNumber: string) {
    return { format, refNumber };
  }

  const rows = [
    populateTable('abc{digits:3}', 'abc001, abc002, abc003'),
    populateTable('211{digits:5}', '21100001, 21100002, 21100003'),
  ];

  return (
    <>
      <Field
        name="shortCode"
        label="Short Code"
        id="short-code-input"
        type="text"
        component={TextField}
        inputProps={{ maxLength: '20' }}
        fullWidth
        required
        data-cy="short-code"
      />
      <LocalizationProvider dateAdapter={DateAdapter}>
        <Field
          name="startCall"
          label={`Start (${timezone})`}
          id="start-call-input"
          inputFormat={dateTimeFormat}
          mask={mask}
          // NOTE: We need to have ampm set to false because otherwise the mask doesn't work properly and suggestion format when you type is not shown at all
          ampm={false}
          component={DateTimePicker}
          inputProps={{ placeholder: dateTimeFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            required: true,
            'data-cy': 'start-date',
          }}
          // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions  https://stackoverflow.com/a/69986695/5619063
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          required
        />
        <Field
          name="endCall"
          label={`End (${timezone})`}
          id="end-call-input"
          inputFormat={dateTimeFormat}
          mask={mask}
          ampm={false}
          allowSameDateSelection
          component={DateTimePicker}
          inputProps={{ placeholder: dateTimeFormat }}
          textField={{
            fullWidth: true,
            required: true,
            'data-cy': 'end-date',
          }}
          // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions
          // https://stackoverflow.com/a/69986695/5619063 and https://github.com/cypress-io/cypress/issues/970
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
          minDate={startCall}
          required
        />
        <Field
          name="referenceNumberFormat"
          validate={validateRefNumFormat}
          label="Reference number format"
          id="reference-number-format-input"
          type="text"
          component={TextField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickOpen}>
                  <HelpIcon />
                </IconButton>
                <Dialog
                  onClose={handleClose}
                  aria-labelledby="customized-dialog-title"
                  open={open}
                >
                  <DialogContent dividers>
                    <Typography gutterBottom color="inherit" variant="body1">
                      A reference number format determines how reference numbers
                      are generated. It consists of a <strong>prefix </strong>
                      and <strong> digits parameter</strong>.<br></br>
                      <br></br>
                      The<strong> prefix</strong> can contain alphanumeric
                      characters and is what all generated reference numbers
                      will begin with. For example, <code>21a</code>.<br></br>
                      <br></br>
                      The <strong> digits parameter</strong> is a numerical
                      value that determines how many digits a proposal&apos;s
                      sequence number is, including padding.It is written as
                      <code>{'{digits:x}'}</code>, where x is a the value of the
                      number. For example, if parameter is 6 (
                      <code>{'{digits:6}'}</code>), the first proposal will be
                      numbered 000001, the second 000002, and so on.
                      <h3>Valid examples</h3>
                      <TableContainer component={Paper}>
                        <Table aria-label="customized table">
                          <TableHead>
                            <StyledTableRow>
                              <StyledTableCell>
                                <strong>Format</strong>
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <strong>Generated reference numbers</strong>
                              </StyledTableCell>
                            </StyledTableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => (
                              <StyledTableRow key={row.format}>
                                <StyledTableCell component="th" scope="row">
                                  {row.format}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                  {row.refNumber}
                                </StyledTableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus variant="text" onClick={handleClose}>
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </InputAdornment>
            ),
          }}
          fullWidth
          data-cy="reference-number-format"
        />
      </LocalizationProvider>

      <FormikUIAutocomplete
        name="templateId"
        label="Call template"
        loading={loadingTemplates}
        noOptionsText="No templates"
        items={templateOptions}
        InputProps={{ 'data-cy': 'call-template' }}
        required
      />
      {featuresMap.get(FeatureId.RISK_ASSESSMENT)?.isEnabled && (
        <FormikUIAutocomplete
          name="esiTemplateId"
          label="ESI template"
          loading={loadingTemplates}
          noOptionsText="No templates"
          items={esiTemplateOptions}
          InputProps={{ 'data-cy': 'call-esi-template' }}
          required
        />
      )}
      <FormikUIAutocomplete
        name="proposalWorkflowId"
        label="Proposal workflow"
        loading={loadingProposalWorkflows}
        noOptionsText="No proposal workflows"
        items={proposalWorkflowOptions}
        InputProps={{
          'data-cy': 'call-workflow',
        }}
        required
      />
      <FormikUIAutocomplete
        name="allocationTimeUnit"
        label="Allocation time unit"
        items={allocationTimeUnitOptions}
        InputProps={{ 'data-cy': 'allocation-time-unit' }}
      />
      <Field
        name="title"
        label="Title (public)"
        id="title-input"
        type="text"
        component={TextField}
        fullWidth
        inputProps={{ maxLength: '100' }}
        data-cy="title"
      />
      <Field
        name="description"
        label="Description (public)"
        id="description-input"
        type="text"
        component={TextField}
        multiline
        fullWidth
        data-cy="description"
      />
    </>
  );
};

export default CallGeneralInfo;
