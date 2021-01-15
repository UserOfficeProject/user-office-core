import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { ChangeEvent, useContext, useState } from 'react';

import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { Answer, SampleBasisConfig } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { EventType } from 'models/QuestionarySubmissionState';
import { SampleSubmissionState } from 'models/SampleSubmissionState';

import { SampleContextType } from '../SampleDeclaration/SampleDeclarationContainer';

const TextFieldNoSubmit = withPreventSubmit(TextField);

function QuestionaryComponentSampleBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { proposalQuestionId, question },
    },
  } = props;

  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as SampleContextType;

  const [title, setTitle] = useState(state?.sample.title);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <>
      <Field
        name={proposalQuestionId}
        label={question}
        placeholder={
          (props.answer.config as SampleBasisConfig).titlePlaceholder
        }
        inputProps={{
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            setTitle(event.currentTarget.value);
          },
          onBlur: () => {
            dispatch({
              type: EventType.SAMPLE_MODIFIED,
              payload: { ...state.sample, title: title },
            });
          },
        }}
        required
        fullWidth
        component={TextFieldNoSubmit}
        data-cy="title-input"
        margin="dense"
      />
    </>
  );
}

const sampleBasisPreSubmit = (answer: Answer) => async ({
  api,
  dispatch,
  state,
}: SubmitActionDependencyContainer) => {
  const sample = (state as SampleSubmissionState).sample;
  const title = sample.title;

  let returnValue = state.questionaryId;

  if (sample.id > 0) {
    const result = await api.updateSample({
      title: title,
      sampleId: sample.id,
    });
    if (result.updateSample.sample) {
      dispatch({
        type: EventType.SAMPLE_UPDATED,
        payload: {
          sample: result.updateSample.sample,
        },
      });
    }
  } else {
    const result = await api.createSample({
      title: title,
      templateId: state.templateId,
      proposalId: sample.proposalId,
      questionId: sample.questionId,
    });

    if (result.createSample.sample) {
      dispatch({
        type: EventType.SAMPLE_CREATED,
        payload: {
          sample: result.createSample.sample,
        },
      });
      returnValue = result.createSample.sample.questionaryId;
    }
  }

  return returnValue;
};

export { QuestionaryComponentSampleBasis, sampleBasisPreSubmit };
