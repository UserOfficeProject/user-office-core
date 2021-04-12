import AssignmentIcon from '@material-ui/icons/Assignment';
import React from 'react';
import * as Yup from 'yup';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType, SubtemplateConfig } from 'generated/sdk';

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
  readonly: false,
  creatable: true,
  icon: <AssignmentIcon />,
  renderers: {
    answerRenderer: function SamplesAnswerRendererComponent({ answer }) {
      return <SamplesAnswerRenderer answer={answer} />;
    },
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: (answer, state, api) => {
    const config = answer.config as SubtemplateConfig;
    let schema = Yup.array().of(Yup.number());
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
      'validateSamplesCompleted',
      'All samples must be completed',
      async () => {
        const samples = await api?.().getSamples({
          filter: {
            questionId: answer.question.id,
            proposalId: state.proposal?.id,
          },
        });

        if (samples) {
          const test = samples?.samples?.every((sample) =>
            sample.questionary.steps.every((step) => step.isCompleted)
          );

          return !!test;
        }

        return true;
      }
    );

    return schema;
  },
  getYupInitialValue: ({ answer }) => answer.value || [],
};
