import ExperimentSaftyReview from 'components/experimentSafety/ExperimentSafetyReview';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ExperimentSafetySubmissionState } from 'models/questionary/experimentSafety/ExperimentSafetySubmissionState';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { EsiWizardStep } from './EsiWizardStep';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const esiQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.PROPOSAL_ESI,

  displayElementFactory: new DefaultStepDisplayElementFactory(
    ExperimentSaftyReview
  ),

  wizardStepFactory: new DefaultWizardStepFactory(
    EsiWizardStep,
    new DefaultReviewWizardStep(
      (state) =>
        (state as ExperimentSafetySubmissionState).experimentSafety
          .esiQuestionarySubmittedAt !== null
    )
  ),
  getItemWithQuestionary(
    api: Sdk,
    experimentSafetyPk: number
  ): Promise<ItemWithQuestionary | null> {
    return api
      .getExperimentSafety({ experimentSafetyPk })
      .then(({ experimentSafety }) => experimentSafety);
  },
};
