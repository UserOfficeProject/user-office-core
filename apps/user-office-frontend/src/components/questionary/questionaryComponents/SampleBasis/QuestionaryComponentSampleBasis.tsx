import { Field } from 'formik';
import { TextField } from 'formik-mui';
import React, { ChangeEvent, useContext, useState } from 'react';

import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { SampleSubmissionState } from 'models/questionary/sample/SampleSubmissionState';

import { SampleContextType } from '../SampleDeclaration/SampleDeclarationContainer';

const TextFieldNoSubmit = withPreventSubmit(TextField);

function QuestionaryComponentSampleBasis(props: BasicComponentProps) {
  const {
    answer: {
      question: { id },
    },
  } = props;

  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as SampleContextType;

  const [title, setTitle] = useState(state?.sample.title || '');

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <>
      <Field
        name={id}
        id={`${id}-field`}
        label={props.answer.question.question}
        inputProps={{
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            setTitle(event.currentTarget.value);
          },
          onBlur: () => {
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
              itemWithQuestionary: { title: title },
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

const sampleBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const sample = (state as SampleSubmissionState).sample;
    const title = sample.title;

    let returnValue = state.questionary.questionaryId;

    if (sample.id > 0) {
      const result = await api.updateSample({
        title: title,
        sampleId: sample.id,
      });
      if (result.updateSample.sample) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
          itemWithQuestionary: result.updateSample.sample,
        });
      }
    } else {
      const result = await api.createSample({
        title: title,
        templateId: state.questionary.templateId,
        proposalPk: sample.proposalPk,
        questionId: sample.questionId,
      });

      if (result.createSample.sample) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_CREATED',
          itemWithQuestionary: result.createSample.sample,
        });
        returnValue = result.createSample.sample.questionaryId;
      }
    }

    return returnValue;
  };

export { QuestionaryComponentSampleBasis, sampleBasisPreSubmit };
