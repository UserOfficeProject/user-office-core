import ListAltIcon from '@mui/icons-material/ListAlt';
import React from 'react';
import * as Yup from 'yup';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, SubTemplateConfig } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';

import QuestionaryComponentGenericTemplate from './QuestionaryComponentGenericTemplate';
import { QuestionGenericTemplateForm } from './QuestionGenericTemplateForm';
import { QuestionTemplateRelationGenericTemplateForm } from './QuestionTemplateRelationGenericTemplateForm';
import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';

type GenericTemplateValidationValue = {
  title?: string | null;
  questionary?: {
    isCompleted?: boolean | null;
  } | null;
};

const getIncompleteGenericTemplatesMessage = (
  genericTemplates: GenericTemplateValidationValue[]
) => {
  const incompleteGenericTemplates = genericTemplates.filter(
    (genericTemplate) => !genericTemplate?.questionary?.isCompleted
  );
  const genericTemplateTitles = incompleteGenericTemplates
    .map((genericTemplate) => genericTemplate.title || 'Untitled entry')
    .join(', ');
  const verb = incompleteGenericTemplates.length === 1 ? 'is' : 'are';

  return `${genericTemplateTitles} ${verb} violating constraints. Please open each entry, fix the validation errors, and click "Save and continue".`;
};

export const genericTemplateDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.GENERIC_TEMPLATE,
  name: 'Sub Template',
  questionaryComponent: QuestionaryComponentGenericTemplate,
  questionForm: () => QuestionGenericTemplateForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationGenericTemplateForm,
  readonly: true,
  creatable: true,
  icon: <ListAltIcon />,
  renderers: {
    answerRenderer: () => null,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: (answer) => {
    const config = answer.config as SubTemplateConfig;
    let schema = Yup.array().of(
      Yup.object({
        questionary: Yup.object({
          isCompleted: Yup.boolean().required(),
        }),
      })
    );

    if (config.required) {
      schema = schema.min(1, 'This is a required field');
    }

    if (config.minEntries) {
      schema = schema.min(
        config.minEntries,
        `Please add at least ${config.minEntries} genericTemplate(s)`
      );
    }
    if (config.maxEntries) {
      schema = schema.max(
        config.maxEntries,
        `Please add at most ${config.maxEntries} genericTemplate(s)`
      );
    }

    schema = schema.test('allGenericTemplatesCompleted', function (value) {
      const genericTemplates =
        (value as GenericTemplateValidationValue[] | undefined) ?? [];
      const hasIncompleteGenericTemplates = genericTemplates.some(
        (genericTemplate) => !genericTemplate?.questionary?.isCompleted
      );

      if (!hasIncompleteGenericTemplates) {
        return true;
      }

      return this.createError({
        message: getIncompleteGenericTemplatesMessage(genericTemplates),
      });
    });

    return schema;
  },
  getYupInitialValue: ({ state, answer }) => {
    const genericTemplatesState = state as ProposalSubmissionState;

    return (
      genericTemplatesState.proposal.genericTemplates?.filter(
        (genericTemplate) => genericTemplate.questionId === answer.question.id
      ) ?? []
    );
  },
};
