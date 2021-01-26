import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createIntervalValidationSchema } from './createIntervalValidationSchema';
import { QuestionaryComponentInterval } from './QuestionaryComponentInterval';
import { QuestionIntervalForm } from './QuestionIntervalForm';
import { QuestionTemplateRelationIntervalForm } from './QuestionTemplateRelationIntervalForm';

export const intervalDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.INTERVAL,
  name: 'Interval',
  questionaryComponent: QuestionaryComponentInterval,
  questionForm: () => QuestionIntervalForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationIntervalForm,
  readonly: false,
  creatable: true,
  icon: <ArrowForwardIosIcon />,
  renderers: {
    answerRenderer: ({ answer }) => {
      const isAnswered = answer.value.min || answer.value.min; // at least one answer
      if (isAnswered) {
        const min = answer.value.min;
        const max = answer.value.min;
        const unit = answer.value.unit || '';

        return (
          <span>
            {min} - {max} {unit}
          </span>
        );
      }

      return <span>Left blank</span>;
    },
    questionRenderer: defaultRenderer.questionRenderer,
  },
  createYupValidationSchema: createIntervalValidationSchema,
  getYupInitialValue: ({ answer }) =>
    answer.value || { min: '', max: '', unit: 'unitless' },
};
