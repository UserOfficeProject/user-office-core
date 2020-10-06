import React from 'react';

import { ProposalComponentBoolean } from 'components/proposal/formComponents/ProposalComponentBoolean';
import { ProposalComponentDatePicker } from 'components/proposal/formComponents/ProposalComponentDatePicker';
import { ProposalComponentEmbellishment } from 'components/proposal/formComponents/ProposalComponentEmbellishment';
import { ProposalComponentFileUpload } from 'components/proposal/formComponents/ProposalComponentFileUpload';
import { ProposalComponentMultipleChoice } from 'components/proposal/formComponents/ProposalComponentMultipleChoice';
import { ProposalComponentSampleBasis } from 'components/proposal/formComponents/ProposalComponentSampleBasis';
import ProposalComponentSampleDeclaration from 'components/proposal/formComponents/ProposalComponentSampleDeclaration';
import { ProposalComponentTextInput } from 'components/proposal/formComponents/ProposalComponentTextInput';
import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import {
  Answer,
  DataType,
  SubtemplateConfig,
  TemplateCategoryId,
} from 'generated/sdk';

function getComponentElement(answer: Answer) {
  switch (answer.question.dataType) {
    case DataType.TEXT_INPUT:
      return ProposalComponentTextInput;
    case DataType.BOOLEAN:
      return ProposalComponentBoolean;
    case DataType.DATE:
      return ProposalComponentDatePicker;
    case DataType.FILE_UPLOAD:
      return ProposalComponentFileUpload;
    case DataType.SELECTION_FROM_OPTIONS:
      return ProposalComponentMultipleChoice;
    case DataType.EMBELLISHMENT:
      return ProposalComponentEmbellishment;
    case DataType.SAMPLE_BASIS:
      return ProposalComponentSampleBasis;
    case DataType.SUBTEMPLATE:
      const config = answer.config as SubtemplateConfig;
      switch (config.templateCategory) {
        case TemplateCategoryId.SAMPLE_DECLARATION:
          return ProposalComponentSampleDeclaration;
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
