import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';

import { Answer } from 'generated/sdk';

import defaultRenderer from './DefaultQuestionRenderer';
import { getQuestionaryComponentDefinition } from './QuestionaryComponentRegistry';

export type QuestionaryMergeViewProps = {
  open: boolean;
  newAnswers: Answer[];
  oldAnswers: Answer[];
  mergeAnswers: (Answers: Answer[]) => void;
};

const QuestionaryMergeView: React.FC<QuestionaryMergeViewProps> = ({
  open,
  newAnswers,
  oldAnswers,
  mergeAnswers,
}) => {
  const allAnswers = oldAnswers.map((oldA) => {
    const current = newAnswers.find((a) => a.question.id === oldA.question.id);

    return {
      questionId: oldA.question.id,
      oldAnswer: oldA,
      currentAnswer: current ?? null,
    };
  });

  const formik = useFormik({
    initialValues: {
      // for each questionId store which side to keep: 'old' | 'new'
      picks: allAnswers.reduce<Record<string, 'old' | 'new'>>(
        (acc, it) => {
          acc[it.questionId] = it.currentAnswer ? 'new' : 'old';

          return acc;
        },
        {} as Record<string, 'old' | 'new'>
      ),
    },
    onSubmit: (values) => {
      const accepted: Answer[] = allAnswers.map((question) =>
        values.picks[question.questionId] === 'new' && question.currentAnswer
          ? question.currentAnswer
          : question.oldAnswer
      );
      mergeAnswers(accepted);
    },
  });

  return (
    <Dialog open={open} fullWidth maxWidth="md" data-cy="merge-modal">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
        }}
      >
        <Typography variant="h6">
          {
            'A User has updated some answers while you have been completing this form. Please review the answers below and select which ones you would like to keep.'
          }
        </Typography>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {allAnswers.map((question) => {
              let renderers = getQuestionaryComponentDefinition(
                question.oldAnswer.question.dataType
              ).renderers;

              if (!renderers) {
                renderers = defaultRenderer;
              }

              return (
                <Grid item xs={12} key={question.questionId}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                      {renderers.questionRenderer(question.oldAnswer.question)}
                    </Typography>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={1}
                      gap={2}
                    >
                      <Box sx={{ width: '50%', wordWrap: 'break-word' }}>
                        <Typography variant="body2" color="textSecondary">
                          Currently saved Answer
                        </Typography>
                        <Typography variant="body1">
                          {renderers.answerRenderer(question.oldAnswer)}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                formik.values.picks[question.questionId] ===
                                'old'
                              }
                              onChange={() =>
                                formik.setFieldValue(
                                  `picks.${question.questionId}`,
                                  'old'
                                )
                              }
                              name={`pick-old-${question.questionId}`}
                            />
                          }
                          label="Keep"
                        />
                      </Box>
                      <Box sx={{ width: '50%', wordWrap: 'break-word' }}>
                        <Typography variant="body2" color="textSecondary">
                          Your current Answer
                        </Typography>
                        <Typography variant="body1">
                          {question.currentAnswer?.value
                            ? renderers.answerRenderer(question.currentAnswer)
                            : 'No answer'}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                formik.values.picks[question.questionId] ===
                                'new'
                              }
                              onChange={() =>
                                formik.setFieldValue(
                                  `picks.${question.questionId}`,
                                  'new'
                                )
                              }
                              name={`pick-new-${question.questionId}`}
                            />
                          }
                          label="Keep"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Please review the answers above and make your selections.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogContent dividers>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item>
              <Box display="flex" gap={1}>
                <Button
                  type="submit"
                  variant="contained"
                  data-cy="merge-update"
                >
                  Update Answers
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default QuestionaryMergeView;
