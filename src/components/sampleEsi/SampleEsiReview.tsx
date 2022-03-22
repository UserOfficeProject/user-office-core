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

import { SampleEsiContextType } from './SampleEsiContainer';

function SampleEsiReview() {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const [isAffirmChecked, setIsAffirmChecked] = useState(false);

  const { state, dispatch } = useContext(
    QuestionaryContext
  ) as SampleEsiContextType;
  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isSubmitted = state.esi.isSubmitted;

  return (
    <>
      <QuestionaryDetails
        questionaryId={state.esi.questionary.questionaryId}
        title="Sample safety input"
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
            const result = await api().updateSampleEsi({
              esiId: state.esi.esiId,
              sampleId: state.esi.sample.id,
              isSubmitted: true,
            });
            if (!result.updateSampleEsi.esi) {
              return;
            }
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
              itemWithQuestionary: result.updateSampleEsi.esi,
            });
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
              itemWithQuestionary: result.updateSampleEsi.esi,
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
