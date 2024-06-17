import EditIcon from '@mui/icons-material/Edit';
import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { updateTimeAllocationValidationSchema } from '@user-office-software/duo-validation';
import clsx from 'clsx';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import {
  InstrumentWithManagementTime,
  Proposal,
  TechnicalReview,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
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

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
  },
  textBold: {
    fontWeight: 'bold',
  },
  disabled: {
    color: theme.palette.text.disabled,
  },
  overwritten: {
    fontWeight: 'bold',
  },
  spacingLeft: {
    marginLeft: theme.spacing(1),
  },
  table: {
    minWidth: 500,
  },
}));

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
  const classes = useStyles();
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
        <Typography variant="h6" className={classes.heading} gutterBottom>
          Technical review info - {instrument?.name}
        </Typography>
        <TableContainer>
          <Table className={classes.table}>
            <TableBody>
              <TableRow key="statusAndTime">
                <TableCell width="25%" className={classes.textBold}>
                  Status
                </TableCell>
                <TableCell width="25%">
                  {technicalReview?.status || '-'}
                </TableCell>
                <TableCell width="25%" className={classes.textBold}>
                  Time allocation(
                  {fapProposalArgs.proposal.call?.allocationTimeUnit}s)
                  {hasWriteAccess && (
                    <Tooltip title="Edit" className={classes.spacingLeft}>
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
                  <span
                    className={clsx({
                      [classes.disabled]: fapTimeAllocation !== null,
                    })}
                  >
                    {technicalReview?.timeAllocation || '-'}
                  </span>
                  {fapTimeAllocation !== null && (
                    <span
                      className={clsx(classes.overwritten, classes.spacingLeft)}
                    >
                      {fapTimeAllocation} (Overwritten)
                    </span>
                  )}
                </TableCell>
              </TableRow>
              <TableRow key="comments">
                <TableCell className={classes.textBold}>
                  Comments for the review panel
                </TableCell>
                <TableCell
                  dangerouslySetInnerHTML={{
                    __html: technicalReview?.publicComment || '-',
                  }}
                />
                <TableCell className={classes.textBold}>Reviewer</TableCell>
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

TechnicalReviewInfo.propTypes = {
  technicalReview: PropTypes.any,
  fapTimeAllocation: PropTypes.number,
  onFapTimeAllocationEdit: PropTypes.func.isRequired,
  fapId: PropTypes.number.isRequired,
  proposal: PropTypes.any.isRequired,
  hasWriteAccess: PropTypes.bool.isRequired,
};

export default TechnicalReviewInfo;
