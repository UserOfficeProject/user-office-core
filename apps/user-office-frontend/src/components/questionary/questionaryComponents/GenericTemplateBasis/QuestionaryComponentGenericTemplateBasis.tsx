import { Field } from 'formik';
import { TextField } from 'formik-mui';
import React, { ChangeEvent, useContext, useState } from 'react';

import withPreventSubmit from 'components/common/withPreventSubmit';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import { GenericTemplateBasisConfig } from 'generated/sdk';
import { SubmitActionDependencyContainer } from 'hooks/questionary/useSubmitActions';
import { GenericTemplateSubmissionState } from 'models/questionary/genericTemplate/GenericTemplateSubmissionState';

import { GenericTemplateContextType } from '../GenericTemplate/GenericTemplateContainer';

const TextFieldNoSubmit = withPreventSubmit(TextField);

function QuestionaryComponentGenericTemplateBasis(props: BasicComponentProps) {
  const {
    answer,
    answer: {
      question: { id },
    },
  } = props;

  const config = answer.config as GenericTemplateBasisConfig;

  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as GenericTemplateContextType;

  const [title, setTitle] = useState(state?.genericTemplate.title || '');

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  return (
    <>
      <Field
        name={id}
        id={`${id}-field`}
        label={config.questionLabel || answer.question.question}
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

const genericTemplateBasisPreSubmit =
  () =>
  async ({ api, dispatch, state }: SubmitActionDependencyContainer) => {
    const genericTemplate = (state as GenericTemplateSubmissionState)
      .genericTemplate;
    const title = genericTemplate.title;

    let returnValue = state.questionary.questionaryId;

    if (genericTemplate.id > 0) {
      const result = await api.updateGenericTemplate({
        title: title,
        genericTemplateId: genericTemplate.id,
      });
      if (result.updateGenericTemplate.genericTemplate) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_MODIFIED',
          itemWithQuestionary: result.updateGenericTemplate.genericTemplate,
        });
      }
    } else {
      const result = await api.createGenericTemplate({
        title: title,
        templateId: state.questionary.templateId,
        proposalPk: genericTemplate.proposalPk,
        questionId: genericTemplate.questionId,
      });

      if (result.createGenericTemplate.genericTemplate) {
        dispatch({
          type: 'ITEM_WITH_QUESTIONARY_CREATED',
          itemWithQuestionary: result.createGenericTemplate.genericTemplate,
        });
        returnValue =
          result.createGenericTemplate.genericTemplate.questionaryId;
      }
    }

    return returnValue;
  };

export {
  QuestionaryComponentGenericTemplateBasis,
  genericTemplateBasisPreSubmit,
};
