import { FormControlLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import React, { ChangeEvent, useContext, useState } from 'react';

import { NavigButton } from 'components/common/NavigButton';
import NavigationFragment from 'components/questionary/NavigationFragment';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { ExperimentSampleContextType } from './ExperimentSampleContainer';

function SampleEsiReview() {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const [isAffirmChecked, setIsAffirmChecked] = useState(false);

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as ExperimentSampleContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted = state.experimentSample.isEsiSubmitted;

  return (
    <>
      <QuestionaryDetails
        questionaryId={state.experimentSample.questionary.questionaryId}
        title="Experiment safety input"
      />

      <NavigationFragment isLoading={isExecutingCall}>
        <FormControlLabel
          control={
            <Checkbox
              onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                setIsAffirmChecked(evt.target.checked);
              }}
              value={isAffirmChecked}
              checked={isAffirmChecked}
              data-cy="confirm-sample-correct-cb"
            />
          }
          label={
            <span>
              * I hereby confirm that all of the entered information regarding
              the sample is correct
            </span>
          }
        />
        <NavigButton
          onClick={async () => {
            const { updateExperimentSample } =
              await api().updateExperimentSample({
                experimentPk: state.experimentSample.experimentPk,
                sampleId: state.experimentSample.sample.id,
                isSubmitted: true,
              });
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
              itemWithQuestionary: updateExperimentSample,
            });
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
              itemWithQuestionary: updateExperimentSample,
            });
          }}
          disabled={isSubmitted || !isAffirmChecked}
          data-cy="submit-esi-button"
        >
          {isSubmitted ? '✔ Ready' : 'Submit'}
        </NavigButton>
      </NavigationFragment>
    </>
  );
}

export default SampleEsiReview;
