import ListAltIcon from '@mui/icons-material/ListAlt';
import React from 'react';
import * as Yup from 'yup';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, SubTemplateConfig } from 'generated/sdk';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import QuestionaryComponentGenericTemplate from './QuestionaryComponentGenericTemplate';
import { QuestionGenericTemplateForm } from './QuestionGenericTemplateForm';
import { QuestionTemplateRelationGenericTemplateForm } from './QuestionTemplateRelationGenericTemplateForm';

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
    let schema = Yup.array().of<Yup.AnyObjectSchema>(Yup.object());

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

    schema = schema.test(
      'allGenericTemplatesCompleted',
      'All genericTemplates must be completed',
      (value) =>
        value?.every(
          (genericTemplate) => genericTemplate?.questionary.isCompleted
        ) ?? false
    );

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
