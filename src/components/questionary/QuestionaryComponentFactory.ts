import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { QuestionaryComponentBoolean } from 'components/questionary/formComponents/QuestionaryComponentBoolean';
import { QuestionaryComponentDatePicker } from 'components/questionary/formComponents/QuestionaryComponentDatePicker';
import { QuestionaryComponentEmbellishment } from 'components/questionary/formComponents/QuestionaryComponentEmbellishment';
import { QuestionaryComponentFileUpload } from 'components/questionary/formComponents/QuestionaryComponentFileUpload';
import { QuestionaryComponentMultipleChoice } from 'components/questionary/formComponents/QuestionaryComponentMultipleChoice';
import { QuestionaryComponentSampleBasis } from 'components/questionary/formComponents/QuestionaryComponentSampleBasis';
import { QuestionaryComponentSampleDeclaration } from 'components/questionary/formComponents/QuestionaryComponentSampleDeclaration';
import { QuestionaryComponentTextInput } from 'components/questionary/formComponents/QuestionaryComponentTextInput';
import {
  Answer,
  DataType,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';

import { QuestionaryComponentProposalBasis } from './formComponents/QuestionaryComponentProposalBasis';

function getComponentElement(answer: Answer) {
  switch (answer.question.dataType) {
    case DataType.TEXT_INPUT:
      return QuestionaryComponentTextInput;
    case DataType.BOOLEAN:
      return QuestionaryComponentBoolean;
    case DataType.DATE:
      return QuestionaryComponentDatePicker;
    case DataType.FILE_UPLOAD:
      return QuestionaryComponentFileUpload;
    case DataType.SELECTION_FROM_OPTIONS:
      return QuestionaryComponentMultipleChoice;
    case DataType.EMBELLISHMENT:
      return QuestionaryComponentEmbellishment;
    case DataType.SAMPLE_BASIS:
      return QuestionaryComponentSampleBasis;
    case DataType.PROPOSAL_BASIS:
      return QuestionaryComponentProposalBasis;
    case DataType.SUBTEMPLATE:
      const config = answer.config as SubtemplateConfig;
      switch (config.templateCategory) {
        case TemplateCategoryId.SAMPLE_DECLARATION:
          return QuestionaryComponentSampleDeclaration;
        default:
          throw new Error(
            `Unkown datatype for factory subcomponent ${config.templateCategory}`
          );
      }
    default:
      throw new Error(
        `Unkown datatype for factory ${answer.question.dataType}`
      );
  }
}

export function createComponent(
  field: Answer,
  props: any
): React.FunctionComponentElement<BasicComponentProps> {
  props.templateField = field;
  props.key = field.question.proposalQuestionId;

  const component = getComponentElement(field);

  if (!component) {
    throw new Error(
      `Could not create component for type ${field.question.dataType}`
    );
  }

  return React.createElement(getComponentElement(field), props);
}
