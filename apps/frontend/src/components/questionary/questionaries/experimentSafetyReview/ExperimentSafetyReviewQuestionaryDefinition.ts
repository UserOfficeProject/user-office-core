import ExperimentSafetyReviewSummary from 'components/experimentSafetyReview/ExperimentSafetyReviewSummary';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ExperimentSafetyReviewSubmissionState } from 'models/questionary/experimentSafetyReview/ExperimentSafetyReviewSubmissionState';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { ExperimentSafetyReviewQuestionaryWizardStep } from './ExperimentSafetyReviewQuestionaryWizardStep';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const experimentSafetyReviewQuestionaryDefinition: QuestionaryDefinition =
  {
    groupId: TemplateGroupId.EXP_SAFETY_REVIEW,
    displayElementFactory: new DefaultStepDisplayElementFactory(
      ExperimentSafetyReviewSummary
    ),
    wizardStepFactory: new DefaultWizardStepFactory(
      ExperimentSafetyReviewQuestionaryWizardStep,
      new DefaultReviewWizardStep((state) => {
        const experimentSafetyState =
          state as ExperimentSafetyReviewSubmissionState;

        // Check if any decision has been made (not null, not undefined, not UNSET)
        const hasInstrumentScientistDecision =
          !!experimentSafetyState.experimentSafety.instrumentScientistDecision;

        const hasExperimentSafetyReviewerDecision =
          !!experimentSafetyState.experimentSafety
            .experimentSafetyReviewerDecision;

        // Return true if any decision has been made - making the review step read-only
        return (
          hasInstrumentScientistDecision || hasExperimentSafetyReviewerDecision
        );
      })
    ),

    getItemWithQuestionary(
      api: Sdk,
      itemId: number
    ): Promise<ItemWithQuestionary | null> {
      return api
        .getExperimentSafety({ experimentSafetyPk: itemId })
        .then(({ experimentSafety }) => {
          return experimentSafety;
        });
    },
  };
