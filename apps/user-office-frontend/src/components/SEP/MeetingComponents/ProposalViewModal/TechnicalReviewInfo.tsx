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
import { Proposal, TechnicalReview } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { getFullUserName } from 'utils/user';

type SEPProposalProps = {
  sepId: number;
  proposal: Proposal;
};

type TechnicalReviewInfoProps = {
  technicalReview: TechnicalReview | null;
  sepTimeAllocation: number | null;
  hasWriteAccess: boolean;
  onSepTimeAllocationEdit: (sepTimeAllocation: number | null) => void;
} & SEPProposalProps;

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
  ...sepProposalArgs
}: {
  timeAllocation: number | null;
  onClose: (newValue?: number | null) => void;
} & SEPProposalProps) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const initialValues = {
    ...sepProposalArgs,
    proposalPk: sepProposalArgs.proposal.primaryKey,
    sepTimeAllocation: timeAllocation,
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
          const result = await api({
            toastSuccessMessage: 'Updated',
          }).updateSEPTimeAllocation(values);

          if (result.updateSEPTimeAllocation.rejection) {
            return;
          }

          onClose(values.sepTimeAllocation);
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
                id="sepTimeAllocation"
                type="number"
                name="sepTimeAllocation"
                label={`Time Allocation(${sepProposalArgs.proposal.call?.allocationTimeUnit}s)`}
                value={values.sepTimeAllocation ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue(
                    'sepTimeAllocation',
                    e.target.value === '' ? null : +e.target.value
                  );
                }}
                disabled={isSubmitting}
                fullWidth
                data-cy="sepTimeAllocation"
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

const TechnicalReviewInfo: React.FC<TechnicalReviewInfoProps> = ({
  technicalReview,
  sepTimeAllocation,
  hasWriteAccess,
  onSepTimeAllocationEdit,
  ...sepProposalArgs
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = (newValue?: number | null) => {
    if (newValue !== undefined) {
      onSepTimeAllocationEdit(newValue);
    }
    setOpen(false);
  };

  return (
    <div data-cy="SEP-meeting-components-technical-review">
      {open && (
        <OverwriteTimeAllocationDialog
          onClose={handleClose}
          timeAllocation={sepTimeAllocation}
          {...sepProposalArgs}
        />
      )}
      <StyledPaper margin={[2, 0]}>
        <Typography variant="h6" className={classes.heading} gutterBottom>
          Technical review info
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
                  {sepProposalArgs.proposal.call?.allocationTimeUnit}s)
                  {hasWriteAccess && (
                    <Tooltip title="Edit" className={classes.spacingLeft}>
                      <IconButton
                        size="medium"
                        onClick={() => setOpen(true)}
                        data-cy="edit-sep-time-allocation"
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={clsx({
                      [classes.disabled]: sepTimeAllocation !== null,
                    })}
                  >
                    {technicalReview?.timeAllocation || '-'}
                  </span>
                  {sepTimeAllocation !== null && (
                    <span
                      className={clsx(classes.overwritten, classes.spacingLeft)}
                    >
                      {sepTimeAllocation} (Overwritten)
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
  sepTimeAllocation: PropTypes.number,
  onSepTimeAllocationEdit: PropTypes.func.isRequired,
  sepId: PropTypes.number.isRequired,
  proposal: PropTypes.any.isRequired,
  hasWriteAccess: PropTypes.bool.isRequired,
};

export default TechnicalReviewInfo;
