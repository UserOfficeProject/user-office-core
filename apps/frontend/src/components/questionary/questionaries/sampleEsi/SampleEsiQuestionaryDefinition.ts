import { DefaultReviewWizardStep } from 'components/questionary/DefaultReviewWizardStep';
import { DefaultStepDisplayElementFactory } from 'components/questionary/DefaultStepDisplayElementFactory';
import { DefaultWizardStepFactory } from 'components/questionary/DefaultWizardStepFactory';
import SampleEsiReview from 'components/sampleEsi/SampleEsiReview';
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { SampleEsiWizardStep } from './SampleEsiWizardStep';

export const sampleEsiQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.SAMPLE_ESI,
  displayElementFactory: new DefaultStepDisplayElementFactory(SampleEsiReview),
  wizardStepFactory: new DefaultWizardStepFactory(
    SampleEsiWizardStep,
    new DefaultReviewWizardStep(() => false)
  ),
  getItemWithQuestionary(
    api: Sdk,
    [esiId, sampleId]: [number, number]
  ): Promise<ItemWithQuestionary | null> {
    return api
      .getSampleEsi({ esiId, sampleId })
      .then(({ sampleEsi }) => sampleEsi);
  },
};
