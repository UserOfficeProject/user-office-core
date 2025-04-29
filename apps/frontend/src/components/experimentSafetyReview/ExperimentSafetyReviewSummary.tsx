import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React, { useContext, useState } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
import { UserContext } from 'context/UserContextProvider';
import { UserRole } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { ExperimentSafetyReviewContextType } from './ExperimentSafetyReviewContainer';
import ExperimentSafetyReviewQuestionaryReview from './ExperimentSafetyReviewQuestionaryReview';
type ExperimentSafetyReviewSummaryProps = {
  confirm: WithConfirmType;
};

function ExperimentSafetyReviewSummary({
  confirm,
}: ExperimentSafetyReviewSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [comment, setComment] = useState<string>('');
  const { api } = useDataApiWithFeedback();
  const { currentRole } = useContext(UserContext);

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ExperimentSafetyReviewContextType;

  if (!state?.experimentSafety) {
    throw new Error('Experiment safety review not found');
  }

  if (!state.experimentSafety.safetyReviewQuestionaryId) {
    throw new Error('Experiment safety review questionary not found');
  }

  return (
    <>
      <ExperimentSafetyReviewQuestionaryReview
        experimentSafety={state.experimentSafety}
      />
      <Divider sx={{ margin: '1rem 0' }} />
      <FormControl fullWidth>
        <InputLabel id="exp-safety-review" shrink>
          Review
        </InputLabel>{' '}
        <Select
          id="technique-select"
          aria-labelledby="exp-safety-review"
          onChange={(e) => {
            setDecision(e.target.value as 'ACCEPTED' | 'REJECTED');
          }}
          value={decision}
          data-cy="safety-review-decision"
        >
          <ListSubheader sx={{ lineHeight: 1 }}>
            <Divider>Decision</Divider>
          </ListSubheader>
          <MenuItem value={'ACCEPTED'}>APPROVE</MenuItem>
          <MenuItem value={'REJECTED'}>REJECT</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <TextField
          id="safety-review-comment"
          label="Comments"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
          data-cy="safety-review-comment"
        />
      </FormControl>

      <Divider sx={{ margin: '1rem 0' }} />
      <NavigationFragment>
        <NavigButton
          onClick={() => dispatch({ type: 'BACK_CLICKED' })}
          disabled={state.stepIndex === 0}
        >
          Back
        </NavigButton>
        <NavigButton
          onClick={() => {
            confirm(
              async () => {
                setIsSubmitting(true);
                try {
                  if (currentRole === UserRole.INSTRUMENT_SCIENTIST) {
                    // Call the instrument scientist mutation
                    const { submitInstrumentScientistExperimentSafetyReview } =
                      await api({
                        toastSuccessMessage:
                          'Safety review submitted successfully',
                      }).submitInstrumentScientistExperimentSafetyReview({
                        experimentSafetyPk:
                          state.experimentSafety.experimentSafetyPk,
                        decision: decision,
                        comment: comment,
                      });

                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                      itemWithQuestionary:
                        submitInstrumentScientistExperimentSafetyReview,
                    });
                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                      itemWithQuestionary:
                        submitInstrumentScientistExperimentSafetyReview,
                    });
                  } else {
                    // For USER_OFFICER, EXPERIMENT_SAFETY_REVIEWER, and others
                    const {
                      submitExperimentSafetyReviewerExperimentSafetyReview,
                    } = await api({
                      toastSuccessMessage:
                        'Safety review submitted successfully',
                    }).submitExperimentSafetyReviewerExperimentSafetyReview({
                      experimentSafetyPk:
                        state.experimentSafety.experimentSafetyPk,
                      decision: decision,
                      comment: comment,
                    });

                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                      itemWithQuestionary:
                        submitExperimentSafetyReviewerExperimentSafetyReview,
                    });
                    dispatch({
                      type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                      itemWithQuestionary:
                        submitExperimentSafetyReviewerExperimentSafetyReview,
                    });
                  }
                } finally {
                  setIsSubmitting(false);
                }
              },
              {
                title: 'Please confirm',
                description:
                  'Are you sure want to submit the Experiment Safety Review?',
              }
            )();
          }}
          isBusy={isSubmitting}
          data-cy="button-submit-experiment-safety-review"
        >
          {false ? '✔ Submitted' : 'Submit'}
        </NavigButton>
        <Button
          onClick={() => {
            // downloadPDFProposal([proposal.primaryKey], proposal.title)
          }}
          color="secondary"
        >
          Download Safety Review Document
        </Button>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ExperimentSafetyReviewSummary);
