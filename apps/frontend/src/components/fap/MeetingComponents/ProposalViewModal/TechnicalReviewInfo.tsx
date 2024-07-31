import EditIcon from '@mui/icons-material/Edit';
import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { updateTimeAllocationValidationSchema } from '@user-office-software/duo-validation';
import { Formik, Form, Field } from 'formik';
import React, { useState } from 'react';

import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import {
  InstrumentWithManagementTime,
  Proposal,
  TechnicalReview,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

type FapProposalProps = {
  fapId: number;
  proposal: Proposal;
};

type TechnicalReviewInfoProps = {
  technicalReview?: TechnicalReview;
  instrument?: InstrumentWithManagementTime | null;
  fapTimeAllocation: number | null;
  hasWriteAccess: boolean;
  onFapTimeAllocationEdit: (fapTimeAllocation: number | null) => void;
} & FapProposalProps;

const OverwriteTimeAllocationDialog = ({
  timeAllocation,
  onClose,
  ...fapProposalArgs
}: {
  timeAllocation: number | null;
  onClose: (newValue?: number | null) => void;
  instrumentId: number;
} & FapProposalProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = {
    ...fapProposalArgs,
    proposalPk: fapProposalArgs.proposal.primaryKey,
    fapTimeAllocation: timeAllocation,
  };

  return (
    <Dialog
      open={true}
      onClose={() => {
        if (isExecutingCall) {
          return;
        }

        onClose();
      }}
      fullWidth
    >
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          await api({
            toastSuccessMessage: 'Updated',
          }).updateFapTimeAllocation({ ...values });

          onClose(values.fapTimeAllocation);
        }}
        validationSchema={updateTimeAllocationValidationSchema}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogTitle>Overwrite allocated time</DialogTitle>
            <DialogContent>
              <Field
                component={TextField}
                margin="dense"
                id="fapTimeAllocation"
                type="number"
                name="fapTimeAllocation"
                label={`Time Allocation(${fapProposalArgs.proposal.call?.allocationTimeUnit}s)`}
                value={values.fapTimeAllocation ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue(
                    'fapTimeAllocation',
                    e.target.value === '' ? null : +e.target.value
                  );
                }}
                disabled={isSubmitting}
                fullWidth
                data-cy="fapTimeAllocation"
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => onClose()}
                variant="text"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-cy="save-time-allocation"
              >
                {isSubmitting ? <UOLoader buttonSized /> : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

const TechnicalReviewInfo = ({
  technicalReview,
  fapTimeAllocation,
  hasWriteAccess,
  onFapTimeAllocationEdit,
  instrument,
  ...fapProposalArgs
}: TechnicalReviewInfoProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = (newValue?: number | null) => {
    if (newValue !== undefined) {
      onFapTimeAllocationEdit(newValue);
    }
    setOpen(false);
  };

  if (!technicalReview) {
    return null;
  }

  return (
    <div data-cy="Fap-meeting-components-technical-review">
      {open && (
        <OverwriteTimeAllocationDialog
          onClose={handleClose}
          timeAllocation={fapTimeAllocation}
          instrumentId={technicalReview.instrumentId}
          {...fapProposalArgs}
        />
      )}
      <StyledPaper margin={[2, 0]}>
        <Typography
          variant="h6"
          sx={(theme) => ({
            marginTop: theme.spacing(2),
          })}
          gutterBottom
        >
          Technical review info - {instrument?.name}
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 500 }}>
            <TableBody>
              <TableRow key="statusAndTime">
                <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                  Status
                </TableCell>
                <TableCell width="25%">
                  {technicalReview?.status || '-'}
                </TableCell>
                <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                  Time allocation(
                  {fapProposalArgs.proposal.call?.allocationTimeUnit}s)
                  {hasWriteAccess && (
                    <Tooltip
                      title="Edit"
                      sx={(theme) => ({ marginLeft: theme.spacing(1) })}
                    >
                      <IconButton
                        size="medium"
                        onClick={() => setOpen(true)}
                        data-cy="edit-fap-time-allocation"
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={(theme) => ({
                      ...(fapTimeAllocation !== null && {
                        color: theme.palette.text.disabled,
                      }),
                    })}
                  >
                    {technicalReview?.timeAllocation || '-'}
                  </Box>
                  {fapTimeAllocation !== null && (
                    <Box
                      component="span"
                      sx={(theme) => ({
                        fontWeight: 'bold',
                        marginLeft: theme.spacing(1),
                      })}
                    >
                      {fapTimeAllocation} (Overwritten)
                    </Box>
                  )}
                </TableCell>
              </TableRow>
              <TableRow key="comments">
                <TableCell sx={BOLD_TEXT_STYLE}>
                  Comments for the review panel
                </TableCell>
                <TableCell
                  dangerouslySetInnerHTML={{
                    __html: technicalReview?.publicComment || '-',
                  }}
                />
                <TableCell sx={BOLD_TEXT_STYLE}>Reviewer</TableCell>
                <TableCell>
                  {getFullUserName(technicalReview?.reviewer)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    </div>
  );
};

export default TechnicalReviewInfo;
