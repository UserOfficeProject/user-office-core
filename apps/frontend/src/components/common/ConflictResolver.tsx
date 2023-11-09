import Check from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Error from '@mui/icons-material/Error';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect } from 'react';

import {
  ConflictResolutionStrategy,
  QuestionComparisonStatus,
} from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontWeight: 'bold',
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  error: {
    color: theme.palette.error.main,
  },
  resolved: {
    color: '#ffbb00',
  },
  check: {
    color: theme.palette.success.main,
  },
  highlight: {
    backgroundColor: '#faed27',
  },
}));

export interface DiffInfo {
  heading: string;
  existingVal: React.ReactNode;
  newVal: React.ReactNode;
  isDifferent: boolean;
}

export function ConflictResolver<T>(props: {
  comparison: T;
  onConflictResolved: (
    comparison: T,
    resolution: ConflictResolutionStrategy
  ) => void;
  getStatus: (comparison: T) => QuestionComparisonStatus;
  getItemId: (comparison: T) => string;
  getItemTitle: (comparison: T) => string;
  getDiffInfo: (comparison: T) => DiffInfo[];
}) {
  const { comparison, onConflictResolved } = props;
  const { getStatus, getItemId, getItemTitle, getDiffInfo } = props;

  const [existingItemCheck, setExistingItemCheck] = React.useState(
    getStatus(comparison) === QuestionComparisonStatus.SAME
  );
  const [newItemCheck, setNewItemCheck] = React.useState(
    getStatus(comparison) === QuestionComparisonStatus.NEW
  );

  const classes = useStyles();

  const getStatusIcon = (status: QuestionComparisonStatus) => {
    const isResolved = existingItemCheck || newItemCheck;
    switch (status) {
      case QuestionComparisonStatus.DIFFERENT:
        return isResolved ? (
          <Check
            className={clsx(classes.icon, classes.resolved)}
            data-cy="resolved-icon"
          />
        ) : (
          <Error
            className={clsx(classes.icon, classes.error)}
            data-cy="conflict-icon"
          />
        );
      case QuestionComparisonStatus.NEW:
        return (
          <Check
            className={clsx(classes.icon, classes.check)}
            data-cy="new-icon"
          />
        );
      case QuestionComparisonStatus.SAME:
        return (
          <DoneAllIcon
            className={clsx(classes.icon, classes.check)}
            data-cy="same-icon"
          />
        );

      default:
    }
  };

  // updating the checkboxes
  useEffect(() => {
    if (existingItemCheck) {
      onConflictResolved(comparison, ConflictResolutionStrategy.USE_EXISTING);
    } else if (newItemCheck) {
      onConflictResolved(comparison, ConflictResolutionStrategy.USE_NEW);
    } else {
      onConflictResolved(comparison, ConflictResolutionStrategy.UNRESOLVED);
    }
  }, [existingItemCheck, newItemCheck, onConflictResolved, comparison]);

  return (
    <Accordion data-cy={`${getItemId(comparison)}-accordion`}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        {getStatusIcon(getStatus(comparison))}
        {getItemTitle(comparison)}
      </AccordionSummary>

      <AccordionDetails>
        <TableContainer>
          <Table size="small" component="span">
            <TableHead>
              <TableRow>
                <TableCell>{getItemId(comparison)}</TableCell>
                <TableCell className={classes.heading}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        data-cy="existing-item-checkbox"
                        disabled={
                          getStatus(comparison) !==
                          QuestionComparisonStatus.DIFFERENT
                        }
                        checked={existingItemCheck}
                        onChange={(e) => {
                          setExistingItemCheck(e.target.checked);
                          setNewItemCheck(false);
                        }}
                      />
                    }
                    label="Existing Question"
                  />
                </TableCell>
                <TableCell className={classes.heading}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        data-cy="new-item-checkbox"
                        disabled={
                          getStatus(comparison) !==
                          QuestionComparisonStatus.DIFFERENT
                        }
                        checked={newItemCheck}
                        onChange={(e) => {
                          setNewItemCheck(e.target.checked);
                          setExistingItemCheck(false);
                        }}
                      />
                    }
                    label="New Question"
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getDiffInfo(comparison).map((diffInfo) => (
                <TableRow
                  className={clsx(diffInfo.isDifferent && classes.highlight)}
                  key={diffInfo.heading}
                >
                  <TableCell className={classes.heading}>
                    {diffInfo.heading}
                  </TableCell>
                  <TableCell>{diffInfo.existingVal}</TableCell>
                  <TableCell>{diffInfo.newVal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}
