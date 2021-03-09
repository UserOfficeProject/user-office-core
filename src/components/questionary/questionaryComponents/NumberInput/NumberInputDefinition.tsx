import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import React from 'react';

import defaultRenderer from 'components/questionary/DefaultQuestionRenderer';
import { DataType } from 'generated/sdk';

import { QuestionaryComponentDefinition } from '../../QuestionaryComponentRegistry';
import { createNumberInputValidationSchema } from './createNumberInputValidationSchema';
import { QuestionaryComponentNumber } from './QuestionaryComponentNumberInput';
import { QuestionNumberForm } from './QuestionNumberInputForm';
import { QuestionTemplateRelationNumberForm } from './QuestionTemplateRelationNumberInputForm';

export const numberInputDefinition: QuestionaryComponentDefinition = {
  dataType: DataType.NUMBER_INPUT,
  name: 'Number',
  questionaryComponent: QuestionaryComponentNumber,
  questionForm: () => QuestionNumberForm,
  questionTemplateRelationForm: () => QuestionTemplateRelationNumberForm,
  readonly: false,
  creatable: true,
  icon: <ExposureZeroIcon />,
  renderers: {
    answerRenderer: function AnswerRendererComponent({ answer }) {
      if (!answer.value.value) {
        return <span>Left blank</span>;
      }

      const value = answer.value.value;
      const unit = answer.value.unit;

      return (
        <span>
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      );
    },
    questionRenderer: defaultRenderer.questionRenderer,
  },

  createYupValidationSchema: createNumberInputValidationSchema,
  getYupInitialValue: ({ answer }) => answer.value || { value: '', unit: null },
};
