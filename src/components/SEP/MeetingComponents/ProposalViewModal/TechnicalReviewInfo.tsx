import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { TechnicalReview } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type SEPProposalProps = {
  sepId: number;
  proposalId: number;
};

type TechnicalReviewInfoProps = {
  technicalReview: TechnicalReview | null;
  sepTimeAllocation: number | null;
  hasWriteAccess: boolean;
  onSepTimeAllocationEdit: (sepTimeAllocation: number | null) => void;
} & SEPProposalProps;

const useStyles = makeStyles(theme => ({
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
}));

const OverwriteTimeAllocationDialog = ({
  timeAllocation,
  onClose,
  ...sepProposalArgs
}: {
  timeAllocation: number | null;
  onClose: (newValue?: number | null) => void;
} & SEPProposalProps) => {
  const [overwriteTimeAllocation, setOverwriteTimeAllocation] = useState<
    number | null
  >(timeAllocation);
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const handleSubmit = async () => {
    const result = await api('Updated').updateSEPTimeAllocation({
      ...sepProposalArgs,
      sepTimeAllocation: overwriteTimeAllocation,
    });
    if (result.updateSEPTimeAllocation.error) {
      return;
    }

    onClose(overwriteTimeAllocation);
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
      <DialogTitle>Overwrite allocated time</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          id="name"
          type="number"
          name="timeAllocation"
          label="Time Allocation(Days)"
          value={overwriteTimeAllocation ?? ''}
          onChange={e => {
            setOverwriteTimeAllocation(
              e.target.value === '' ? null : +e.target.value
            );
          }}
          disabled={isExecutingCall}
          fullWidth
          data-cy="timeAllocation"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose()}
          color="primary"
          disabled={isExecutingCall}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isExecutingCall}
          data-cy="save-time-allocation"
        >
          {isExecutingCall ? <UOLoader buttonSized /> : 'Save'}
        </Button>
      </DialogActions>
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
        <Table>
          <TableBody>
            <TableRow key="statusAndTime">
              <TableCell width="25%" className={classes.textBold}>
                Status
              </TableCell>
              <TableCell width="25%">
                {technicalReview?.status || '-'}
              </TableCell>
              <TableCell width="25%" className={classes.textBold}>
                Time allocation
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
                Internal comment
              </TableCell>
              <TableCell>{technicalReview?.comment || '-'}</TableCell>
              <TableCell className={classes.textBold}>Public comment</TableCell>
              <TableCell>{technicalReview?.publicComment || '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </StyledPaper>
    </div>
  );
};

TechnicalReviewInfo.propTypes = {
  technicalReview: PropTypes.any,
  sepTimeAllocation: PropTypes.number,
  onSepTimeAllocationEdit: PropTypes.func.isRequired,
  sepId: PropTypes.number.isRequired,
  proposalId: PropTypes.number.isRequired,
  hasWriteAccess: PropTypes.bool.isRequired,
};

export default TechnicalReviewInfo;
