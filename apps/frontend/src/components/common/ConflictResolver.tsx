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
  useTheme,
} from '@mui/material';
import React, { useEffect } from 'react';

import {
  ConflictResolutionStrategy,
  QuestionComparisonStatus,
} from 'generated/sdk';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';

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
  const theme = useTheme();
  const { comparison, onConflictResolved } = props;
  const { getStatus, getItemId, getItemTitle, getDiffInfo } = props;

  const [existingItemCheck, setExistingItemCheck] = React.useState(
    getStatus(comparison) === QuestionComparisonStatus.SAME
  );
  const [newItemCheck, setNewItemCheck] = React.useState(
    getStatus(comparison) === QuestionComparisonStatus.NEW
  );

  const getStatusIcon = (status: QuestionComparisonStatus) => {
    const isResolved = existingItemCheck || newItemCheck;
    switch (status) {
      case QuestionComparisonStatus.DIFFERENT:
        return isResolved ? (
          <Check
            sx={{
              marginRight: theme.spacing(2),
              color: '#ffbb00',
            }}
            data-cy="resolved-icon"
          />
        ) : (
          <Error
            sx={{
              marginRight: theme.spacing(2),
              color: theme.palette.error.main,
            }}
            data-cy="conflict-icon"
          />
        );
      case QuestionComparisonStatus.NEW:
        return (
          <Check
            sx={{
              marginRight: theme.spacing(2),
              color: theme.palette.success.main,
            }}
            data-cy="new-icon"
          />
        );
      case QuestionComparisonStatus.SAME:
        return (
          <DoneAllIcon
            sx={{
              marginRight: theme.spacing(2),
              color: theme.palette.success.main,
            }}
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
                <TableCell sx={BOLD_TEXT_STYLE}>
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
                <TableCell sx={BOLD_TEXT_STYLE}>
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
                  sx={{
                    ...(diffInfo.isDifferent && { backgroundColor: '#faed27' }),
                  }}
                  key={diffInfo.heading}
                >
                  <TableCell sx={BOLD_TEXT_STYLE}>{diffInfo.heading}</TableCell>
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
