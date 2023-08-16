import React, { ReactElement } from 'react';

import { WizardStep } from 'models/questionary/QuestionarySubmissionState';
import { FunctionType } from 'utils/utilTypes';
import { WithConfirmType } from 'utils/withConfirm';

import QuestionaryStepView from './QuestionaryStepView';

export class DefaultStepDisplayElementFactory
  implements StepDisplayElementFactory
{
  constructor(
    private reviewStep: (props: {
      onComplete?: FunctionType<void>;
      confirm: WithConfirmType;
    }) => ReactElement
  ) {}

  getDisplayElement(wizardStep: WizardStep, isReadOnly: boolean) {
    switch (wizardStep.type) {
      case 'QuestionaryStep':
        return (
          <QuestionaryStepView
            readonly={isReadOnly}
            topicId={wizardStep.payload.topicId}
          />
        );
      case 'ReviewStep':
        return React.createElement(this.reviewStep);

      default:
        throw new Error(`Unknown step type ${wizardStep.type}`);
    }
  }
}

export interface StepDisplayElementFactory {
  getDisplayElement(
    wizardStep: WizardStep,
    isReadonly: boolean
  ): React.ReactNode;
}
