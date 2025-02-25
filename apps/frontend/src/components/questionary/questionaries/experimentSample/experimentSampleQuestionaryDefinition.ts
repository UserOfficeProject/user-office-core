import SampleEsiReview from 'components/experimentSample/SampleEsiReview';
import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { ExperimentSampleWizardStep } from './ExperimentSampleWizardStep';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const experimentSampleQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.SAMPLE_ESI,
  displayElementFactory: new DefaultStepDisplayElementFactory(SampleEsiReview),
  wizardStepFactory: new DefaultWizardStepFactory(
    ExperimentSampleWizardStep,
    new DefaultReviewWizardStep(() => false)
  ),
  getItemWithQuestionary(
    api: Sdk,
    [experimentPk, sampleId]: [number, number]
  ): Promise<ItemWithQuestionary | null> {
    return api
      .getExperimentSample({ experimentPk, sampleId })
      .then(({ experimentSample }) => experimentSample);
  },
};
