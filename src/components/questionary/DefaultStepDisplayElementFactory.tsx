import React, { FC } from 'react';

import { WizardStep } from 'models/questionary/QuestionarySubmissionState';

import QuestionaryStepView from './QuestionaryStepView';

export class DefaultStepDisplayElementFactory
  implements StepDisplayElementFactory
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private reviewStep: FC<any>) {}

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
