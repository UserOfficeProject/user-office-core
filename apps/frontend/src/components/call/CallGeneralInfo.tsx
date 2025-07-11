import HelpIcon from '@mui/icons-material/Help';
import LaunchIcon from '@mui/icons-material/Launch';
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Field, useFormikContext } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import DateTimePicker from 'components/common/FormikUIDateTimePicker';
import DayTimeRangePicker from 'components/common/FormikUIDayTimeRangePicker';
import TextField from 'components/common/FormikUITextField';
import RefreshListIcon from 'components/common/RefresListIcon';
import StyledDialog from 'components/common/StyledDialog';
import { ProposalStatusDefaultShortCodes } from 'components/proposal/ProposalsSharedConstants';
import { FeatureContext } from 'context/FeatureContextProvider';
import {
  AllocationTimeUnits,
  CreateCallMutationVariables,
  FeatureId,
  GetTemplatesQuery,
  UpdateCallMutationVariables,
  Workflow,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const CallGeneralInfo = ({
  loadingProposalWorkflows,
  proposalWorkflows,
  templates,
  esiTemplates,
  pdfTemplates,
  fapReviewTemplates,
  technicalReviewTemplates,
  loadingTemplates,
  reloadTemplates,
  reloadEsi,
  reloadPdfTemplates,
  reloadFapReviewTemplates,
  reloadTechnicalReviewTemplates,
  reloadProposalWorkflows,
}: {
  reloadTemplates: () => void;
  reloadEsi: () => void;
  reloadPdfTemplates: () => void;
  reloadFapReviewTemplates: () => void;
  reloadTechnicalReviewTemplates: () => void;
  reloadProposalWorkflows: () => void;
  templates: GetTemplatesQuery['templates'];
  esiTemplates: GetTemplatesQuery['templates'];
  pdfTemplates: GetTemplatesQuery['templates'];
  fapReviewTemplates: GetTemplatesQuery['templates'];
  technicalReviewTemplates: GetTemplatesQuery['templates'];
  loadingTemplates: boolean;
  proposalWorkflows: Workflow[];
  loadingProposalWorkflows: boolean;
}) => {
  const { featuresMap } = useContext(FeatureContext);
  const { format: dateTimeFormat, timezone } = useFormattedDateTime();
  const [internalCallDate, setInternalCallDate] = useState({
    showField: false,
    isValueSet: false,
  });

  const theme = useTheme();
  const { t } = useTranslation();

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

  const pdfTemplateOptions =
    pdfTemplates?.map((template) => ({
      text: template.name,
      value: template.templateId,
    })) || [];

  const fapReviewTemplateOptions =
    fapReviewTemplates?.map((template) => ({
      text: template.name,
      value: template.templateId,
    })) || [];

  const technicalReviewTemplateOptions =
    technicalReviewTemplates?.map((template) => ({
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
    (CreateCallMutationVariables | UpdateCallMutationVariables) & {
      startEndDate: { from: string; to: string };
    }
  >();

  const { values, setValues } = formik;
  const { startEndDate, proposalWorkflowId, templateId, esiTemplateId } =
    values;

  useEffect(() => {
    const selectedProposalWorkFlow = proposalWorkflows.find(
      (value) => value.id === proposalWorkflowId
    );
    if (selectedProposalWorkFlow) {
      const result = selectedProposalWorkFlow.workflowConnectionGroups.some(
        (workGroup) => {
          return workGroup.connections.some((connectionStatus) => {
            return (
              connectionStatus.status.shortCode ===
              ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED_INTERNAL
            );
          });
        }
      );
      setInternalCallDate({ showField: result, isValueSet: true });
    }
  }, [proposalWorkflowId, proposalWorkflows]);
  useEffect(() => {
    if (
      internalCallDate.isValueSet &&
      !internalCallDate.showField &&
      startEndDate.to
    ) {
      setValues((prevState) => {
        const endCallInternal = startEndDate.to;
        const endCall = startEndDate.to;

        return { ...prevState, endCallInternal, endCall };
      });
    }
  }, [setValues, startEndDate, setInternalCallDate, internalCallDate]);
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
        label="Short Code (public)"
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
          name="startEndDate"
          label={`Start and End date (${timezone})`}
          id="start-end-call-input"
          format={dateTimeFormat}
          ampm={false}
          component={DayTimeRangePicker}
          inputProps={{ placeholder: dateTimeFormat }}
          allowSameDateSelection
          textField={{
            fullWidth: true,
            required: true,
            'data-cy': 'start-end-date',
          }}
          // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions  https://stackoverflow.com/a/69986695/5619063
          desktopModeMediaQuery={theme.breakpoints.up('sm')}
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
                <StyledDialog
                  onClose={handleClose}
                  aria-labelledby="customized-dialog-title"
                  open={open}
                  title="Reference Number Format"
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
                </StyledDialog>
              </InputAdornment>
            ),
          }}
          fullWidth
          data-cy="reference-number-format"
        />
      </LocalizationProvider>
      <FormControl fullWidth>
        <FormikUIAutocomplete
          name="templateId"
          label="Proposal template"
          loading={loadingTemplates}
          noOptionsText="No templates"
          items={templateOptions}
          InputProps={{
            'data-cy': 'call-template',
            endAdornment: <RefreshListIcon onClick={reloadTemplates} />,
          }}
          required
        />
        <Link
          href={
            templateId ? `QuestionaryEditor/${templateId}` : 'ProposalTemplates'
          }
          target="_blank"
          sx={{
            marginLeft: 'auto',
            marginRight: 0,
          }}
        >
          Edit selected template
          <LaunchIcon
            fontSize="small"
            sx={{
              verticalAlign: 'middle',
              marginLeft: theme.spacing(0.5),
            }}
          />
        </Link>
      </FormControl>
      {featuresMap.get(FeatureId.RISK_ASSESSMENT)?.isEnabled && (
        <FormControl fullWidth>
          <FormikUIAutocomplete
            name="esiTemplateId"
            label="Proposal ESI template"
            loading={loadingTemplates}
            noOptionsText="No templates"
            items={esiTemplateOptions}
            InputProps={{
              'data-cy': 'call-esi-template',
              endAdornment: <RefreshListIcon onClick={reloadEsi} />,
            }}
            required
          />
          <Link
            href={
              esiTemplateId
                ? `QuestionaryEditor/${esiTemplateId}`
                : 'EsiTemplates'
            }
            target="_blank"
            sx={{
              marginLeft: 'auto',
              marginRight: 0,
            }}
          >
            Edit selected template
            <LaunchIcon
              sx={{
                verticalAlign: 'middle',
                marginLeft: theme.spacing(0.5),
              }}
              fontSize="small"
            />
          </Link>
        </FormControl>
      )}
      <FormikUIAutocomplete
        name="pdfTemplateId"
        label="PDF template"
        loading={loadingTemplates}
        noOptionsText="No templates"
        items={pdfTemplateOptions}
        InputProps={{
          'data-cy': 'call-pdf-template',
          endAdornment: <RefreshListIcon onClick={reloadPdfTemplates} />,
        }}
      />
      <FormikUIAutocomplete
        name="fapReviewTemplateId"
        label={t('FAP Review template')}
        loading={loadingTemplates}
        noOptionsText="No templates"
        items={fapReviewTemplateOptions}
        InputProps={{
          'data-cy': 'call-fap-review-template',
          endAdornment: <RefreshListIcon onClick={reloadFapReviewTemplates} />,
        }}
        required
      />
      <FormikUIAutocomplete
        name="technicalReviewTemplateId"
        label="Technical Review template"
        loading={loadingTemplates}
        noOptionsText="No templates"
        items={technicalReviewTemplateOptions}
        InputProps={{
          'data-cy': 'call-technical-review-template',
          endAdornment: (
            <RefreshListIcon onClick={reloadTechnicalReviewTemplates} />
          ),
        }}
        required
      />
      <FormikUIAutocomplete
        name="proposalWorkflowId"
        label="Proposal workflow"
        loading={loadingProposalWorkflows}
        noOptionsText="No proposal workflows"
        items={proposalWorkflowOptions}
        InputProps={{
          'data-cy': 'call-workflow',
          endAdornment: <RefreshListIcon onClick={reloadProposalWorkflows} />,
        }}
        required
      />
      <LocalizationProvider dateAdapter={DateAdapter}>
        {internalCallDate.showField && (
          <Field
            name="endCallInternal"
            label={`End Internal (${timezone})`}
            id="end-call-internal-input"
            format={dateTimeFormat}
            ampm={false}
            allowSameDateSelection
            component={DateTimePicker}
            inputProps={{ placeholder: dateTimeFormat }}
            textField={{
              fullWidth: true,
              required: true,
              'data-cy': 'end-call-internal-date',
            }}
            // NOTE: This is needed just because Cypress testing a Material-UI datepicker is not working on Github actions
            // https://stackoverflow.com/a/69986695/5619063 and https://github.com/cypress-io/cypress/issues/970
            desktopModeMediaQuery={theme.breakpoints.up('sm')}
            minDate={startEndDate.to}
            required
          />
        )}
      </LocalizationProvider>
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
