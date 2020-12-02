import { Typography } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useState,
} from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { Answer, SampleBasisConfig } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { EventType } from 'models/QuestionarySubmissionState';
import { SampleSubmissionState } from 'models/SampleSubmissionState';

import { SampleContext } from '../SampleDeclaration/SampleDeclarationContainer';

function QuestionaryComponentSampleBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { proposalQuestionId, question },
    },
  } = props;
  const sampleContext = useContext(SampleContext);
  const [title, setTitle] = useState(sampleContext.state?.sample.title || '');

  useEffect(() => {
    const newTitle = sampleContext.state?.sample.title || '';
    setTitle(newTitle);
    sampleContext.dispatch({
      type: EventType.FIELD_CHANGED,
      payload: {
        id: proposalQuestionId,
        newValue: newTitle,
      },
    }); // Sets this sets Formik initial value, because sample_basis is a little special and initial value contains null
  }, [sampleContext, proposalQuestionId]);

  return (
    <>
      <Typography>{question}</Typography>
      <Field
        name={proposalQuestionId}
        label={(props.answer.config as SampleBasisConfig).titlePlaceholder}
        component={TextField}
        fullWidth
        data-cy="title-input"
        inputProps={{
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            setTitle(event.currentTarget.value);
          },
          onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              event.preventDefault();

              return false;
            }
          },
          onBlur: () => {
            sampleContext.dispatch({
              type: EventType.SAMPLE_MODIFIED,
              payload: { sample: { title: title } },
            });
          },
        }}
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
    }
  }
};

export { QuestionaryComponentSampleBasis, sampleBasisPreSubmit };
