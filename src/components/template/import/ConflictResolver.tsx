import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Check from '@material-ui/icons/Check';
import Error from '@material-ui/icons/Error';
import ExpandMore from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import React, { useEffect } from 'react';

import {
  ConflictResolutionStrategy,
  QuestionComparison,
  QuestionComparisonStatus,
} from 'generated/sdk';
import { deepEqual } from 'utils/json';

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
    color: '#00ff00',
  },
  highlight: {
    backgroundColor: '#faed27',
  },
}));

export function ConflictResolver(props: {
  questionComparison: QuestionComparison;
  onConflictResolved: (
    comparison: QuestionComparison,
    resolution: ConflictResolutionStrategy
  ) => void;
}) {
  const { questionComparison, onConflictResolved } = props;
  const { existingQuestion, newQuestion, status } = questionComparison;

  const [existingQuestionCheck, setExistingQuestionCheck] = React.useState(
    questionComparison.status === QuestionComparisonStatus.SAME
  );
  const [newQuestionCheck, setNewQuestionCheck] = React.useState(
    questionComparison.status === QuestionComparisonStatus.NEW
  );

  const isNaturalKeyDifferent =
    existingQuestion && existingQuestion?.naturalKey !== newQuestion.naturalKey;
  const isQuestionDifferent =
    existingQuestion && existingQuestion?.question !== newQuestion.question;
  const isConfigDifferent =
    existingQuestion &&
    deepEqual(existingQuestion?.config, newQuestion.config) === false;

  const classes = useStyles();

  const getStatusIcon = (status: QuestionComparisonStatus) => {
    const isResolved = existingQuestionCheck || newQuestionCheck;
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
      case QuestionComparisonStatus.SAME:
        return (
          <Check
            className={clsx(classes.icon, classes.check)}
            data-cy="same-icon"
          />
        );

      default:
    }
  };

  // updating the checkboxes
  useEffect(() => {
    if (existingQuestionCheck) {
      onConflictResolved(
        questionComparison,
        ConflictResolutionStrategy.USE_EXISTING
      );
    } else if (newQuestionCheck) {
      onConflictResolved(
        questionComparison,
        ConflictResolutionStrategy.USE_NEW
      );
    } else {
      onConflictResolved(
        questionComparison,
        ConflictResolutionStrategy.UNRESOLVED
      );
    }
  }, [
    existingQuestionCheck,
    newQuestionCheck,
    onConflictResolved,
    questionComparison,
  ]);

  return (
    <Accordion data-cy={`${newQuestion.id}-accordion`}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        {getStatusIcon(status)}
        {newQuestion.question}
      </AccordionSummary>

      <AccordionDetails>
        <TableContainer>
          <Table size="small" component="span">
            <TableHead>
              <TableRow>
                <TableCell>{newQuestion.id}</TableCell>
                <TableCell className={classes.heading}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        data-cy="existing-question-checkbox"
                        disabled={status !== QuestionComparisonStatus.DIFFERENT}
                        checked={existingQuestionCheck}
                        onChange={(e) => {
                          setExistingQuestionCheck(e.target.checked);
                          setNewQuestionCheck(false);
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
                        data-cy="new-question-checkbox"
                        disabled={status !== QuestionComparisonStatus.DIFFERENT}
                        checked={newQuestionCheck}
                        onChange={(e) => {
                          setNewQuestionCheck(e.target.checked);
                          setExistingQuestionCheck(false);
                        }}
                      />
                    }
                    label="New Question"
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                className={clsx(isNaturalKeyDifferent && classes.highlight)}
              >
                <TableCell className={classes.heading}>Natural key</TableCell>
                <TableCell>{existingQuestion?.naturalKey || '-'}</TableCell>
                <TableCell>{newQuestion.naturalKey}</TableCell>
              </TableRow>
              <TableRow
                className={clsx(isQuestionDifferent && classes.highlight)}
              >
                <TableCell className={classes.heading}>Question</TableCell>
                <TableCell>{existingQuestion?.question || '-'}</TableCell>
                <TableCell>{newQuestion.question}</TableCell>
              </TableRow>
              <TableRow
                className={clsx(isConfigDifferent && classes.highlight)}
              >
                <TableCell className={classes.heading}>Config</TableCell>
                <TableCell>
                  <pre>
                    {JSON.stringify(existingQuestion?.config, undefined, 4) ||
                      '-'}
                  </pre>
                </TableCell>
                <TableCell>
                  <pre>{JSON.stringify(newQuestion?.config, undefined, 4)}</pre>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}
