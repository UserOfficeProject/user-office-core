import React, { useContext } from 'react';

import { StepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { SampleContextType } from 'components/questionary/questionaryComponents/SampleDeclaration/SampleDeclarationContainer';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { WizardStep } from 'models/questionary/QuestionarySubmissionState';

const SampleQuestionaryStepView = ({
  topicId,
  isReadonly,
  wizardStep,
}: {
  topicId: number;
  isReadonly: boolean;
  wizardStep: WizardStep;
}) => {
  const { dispatch, state } = useContext(
    QuestionaryContext
  ) as SampleContextType;

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const isLastStep = (wizardStep: WizardStep) =>
    state.wizardSteps[state.wizardSteps.length - 1] === wizardStep;

  return (
    <div>
      <QuestionaryStepView
        readonly={isReadonly}
        topicId={topicId}
        onStepComplete={() => {
          if (isLastStep(wizardStep)) {
            dispatch({
              type: 'ITEM_WITH_QUESTIONARY_SUBMITTED',
              itemWithQuestionary: state.sample,
            });
          }
        }}
      />
    </div>
  );
};

export class SampleStepDisplayElementFactory
  implements StepDisplayElementFactory
{
  getDisplayElement(wizardStep: WizardStep, isReadonly: boolean) {
    switch (wizardStep.type) {
      case 'QuestionaryStep':
        return (
          <SampleQuestionaryStepView
            isReadonly={isReadonly}
            topicId={wizardStep.payload.topicId}
            wizardStep={wizardStep}
          />
        );

      default:
        throw new Error(`Unknown step type ${wizardStep.type}`);
    }
  }
}
