import { JSDict } from '@esss-swap/duo-localisation';
import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { ProposalComponentBoolean } from 'components/proposal/ProposalComponentBoolean';
import { ProposalComponentDatePicker } from 'components/proposal/ProposalComponentDatePicker';
import { ProposalComponentEmbellishment } from 'components/proposal/ProposalComponentEmbellishment';
import { ProposalComponentFileUpload } from 'components/proposal/ProposalComponentFileUpload';
import { ProposalComponentMultipleChoice } from 'components/proposal/ProposalComponentMultipleChoice';
import { ProposalComponentSubtemplate } from 'components/proposal/ProposalComponentSubtemplate';
import { ProposalComponentTextInput } from 'components/proposal/ProposalComponentTextInput';
import { DataType, Answer } from 'generated/sdk';

export class QuestionaryComponentFactory {
  private componentMap = JSDict.Create<string, any>();

  constructor() {
    this.componentMap.put(DataType.TEXT_INPUT, ProposalComponentTextInput);
    this.componentMap.put(DataType.BOOLEAN, ProposalComponentBoolean);
    this.componentMap.put(DataType.DATE, ProposalComponentDatePicker);
    this.componentMap.put(DataType.FILE_UPLOAD, ProposalComponentFileUpload);
    this.componentMap.put(
      DataType.SELECTION_FROM_OPTIONS,
      ProposalComponentMultipleChoice
    );
    this.componentMap.put(
      DataType.EMBELLISHMENT,
      ProposalComponentEmbellishment
    );
    this.componentMap.put(DataType.SUBTEMPLATE, ProposalComponentSubtemplate);
  }
  createComponent(
    field: Answer,
    props: any
  ): React.ComponentElement<BasicComponentProps, any> {
    props.templateField = field;
    props.key = field.question.proposalQuestionId;

    const component = this.componentMap.get(field.question.dataType);

    if (!component) {
      throw new Error(
        `Could not create component for type ${field.question.dataType}`
      );
    }

    return React.createElement(component, props);
  }
}
