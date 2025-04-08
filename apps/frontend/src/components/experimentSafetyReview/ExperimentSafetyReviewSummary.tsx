import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { useContext, useState } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
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
          onChange={() => {
            // const newValue: TechniqueFilterInput = {
            //   techniqueId: null,
            //   showMultiTechniqueProposals: false,
            //   showAllProposals: false,
            // };
          }}
          value={'APPROVE'}
        >
          <ListSubheader sx={{ lineHeight: 1 }}>
            <Divider>General</Divider>
          </ListSubheader>
          <MenuItem value={'APPROVE'}>APPROVE</MenuItem>
          <MenuItem value={'REJECT'}>REJECT</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ margin: '1rem 0' }} />
      <NavigationFragment
      // disabled={proposal.status?.id === 0}
      // isLoading={isSubmitting}
      >
        <NavigButton
          onClick={() => dispatch({ type: 'BACK_CLICKED' })}
          disabled={state.stepIndex === 0}
          // isBusy={isSubmitting}
        >
          Back
        </NavigButton>
        <NavigButton
          onClick={() => {
            confirm(
              async () => {
                setIsSubmitting(true);
                // try {
                //   const { submitProposal } = await api({
                //     toastSuccessMessage: proposalSubmissionSuccessMessage,
                //   }).submitProposal({
                //     proposalPk: state.proposal.primaryKey,
                //   });

                //   dispatch({
                //     type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
                //     itemWithQuestionary: submitProposal,
                //   });
                //   dispatch({
                //     type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
                //     itemWithQuestionary: submitProposal,
                //   });
                // } finally {
                //   setIsSubmitting(false);
                // }
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
          onClick={
            () => alert('hi')
            // downloadPDFProposal([proposal.primaryKey], proposal.title)
          }
          color="secondary"
        >
          Download Safety Review Document
        </Button>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(ExperimentSafetyReviewSummary);
