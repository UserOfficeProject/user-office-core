import AssignmentIcon from '@material-ui/icons/Assignment';
import React from 'react';
import * as Yup from 'yup';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, Sample, SubtemplateConfig } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import QuestionaryComponentSampleDeclaration from './QuestionaryComponentSampleDeclaration';
import { QuestionSampleDeclarationForm } from './QuestionSampleDeclarationForm';
import { QuestionTemplateRelationSampleDeclarationForm } from './QuestionTemplateRelationSampleDeclarationForm';
import SamplesAnswerRenderer from './SamplesAnswerRenderer';

export const sampleDeclarationDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.SAMPLE_DECLARATION,
  name: 'Sample Declaration',
  questionaryComponent: QuestionaryComponentSampleDeclaration,
  questionForm: () => QuestionSampleDeclarationForm,
  questionTemplateRelationForm: () =>
    QuestionTemplateRelationSampleDeclarationForm,
  readonly: true,
  creatable: true,
  icon: <AssignmentIcon />,
  renderers: {
    answerRenderer: SamplesAnswerRenderer,
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: (answer) => {
    const config = answer.config as SubtemplateConfig;
    let schema = Yup.array().of(Yup.object<Sample>());

    if (config.minEntries) {
      schema = schema.min(
        config.minEntries,
        `Please add at least ${config.minEntries} sample(s)`
      );
    }
    if (config.maxEntries) {
      schema = schema.max(
        config.maxEntries,
        `Please add at most ${config.maxEntries} sample(s)`
      );
    }

    schema = schema.test(
      'allSamplesCompleted',
      'All samples must be completed',
      (value) =>
        value?.every((sample) => sample?.questionary.isCompleted) ?? false
    );

    return schema;
  },
  getYupInitialValue: ({ state, answer }) => {
    return (
      state.proposal?.samples?.filter(
        (sample) => sample.questionId === answer.question.id
      ) ?? []
    );
  },
};
