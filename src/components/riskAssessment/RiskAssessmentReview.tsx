import { makeStyles } from '@material-ui/core';
import React, { useContext } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { RiskAssessmentStatus } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { RiskAssessmentContextType } from './RiskAssessmentContainer';

const useStyles = makeStyles(() => ({
  sampleList: {
    listStyle: 'none',
    padding: 0,
  },
}));

type RiskAssessmentReviewProps = {
  onComplete?: FunctionType<void>;
  confirm: WithConfirmType;
};

function RiskAssessmentReview({ confirm }: RiskAssessmentReviewProps) {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const classes = useStyles();

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as RiskAssessmentContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted =
    state.riskAssessment.status === RiskAssessmentStatus.SUBMITTED;

  const additionalDetails: TableRowData[] = [
    { label: 'Status', value: isSubmitted ? 'Submitted' : 'Draft' },
    {
      label: 'Samples',
      value: (
        <ul className={classes.sampleList}>
          {state.riskAssessment.samples.map((sample) => (
            <li key={sample.id}>{sample.title}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <QuestionaryDetails
        questionaryId={state.riskAssessment.questionary.questionaryId}
        additionalDetails={additionalDetails}
        title="Risk assessment information"
      />
      <NavigationFragment isLoading={isExecutingCall}>
        <NavigButton
          onClick={() =>
            confirm(
              async () => {
                const result = await api().updateRiskAssessment({
                  riskAssessmentId: state.riskAssessment.riskAssessmentId,
                  status: RiskAssessmentStatus.SUBMITTED,
                });
                if (!result.updateRiskAssessment.riskAssessment) {
                  return;
                }
                dispatch({
                  type: 'RISK_ASSESSMENT_MODIFIED',
                  assessment: result.updateRiskAssessment.riskAssessment,
                });
                dispatch({
                  type: 'RISK_ASSESSMENT_SUBMITTED',
                  assessment: result.updateRiskAssessment.riskAssessment,
                });
              },
              {
                title: 'Confirmation',
                description:
                  'I am aware that no further edits can be done after riskAssessment submission.',
              }
            )()
          }
          disabled={isSubmitted}
          variant="contained"
          color="primary"
          data-cy="submit-riskAssessment-button"
        >
          {isSubmitted ? '✔ Submitted' : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </>
  );
}

export default withConfirm(RiskAssessmentReview);
