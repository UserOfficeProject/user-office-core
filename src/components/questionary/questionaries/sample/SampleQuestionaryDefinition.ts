import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { SampleStepDisplayElementFactory } from './SampleStepDisplayElementFactory';
import { StepsWizardWithoutReviewStepFactory } from './StepsWizardWithoutReviewStepFactory';

export const sampleQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.SAMPLE,
  displayElementFactory: new SampleStepDisplayElementFactory(),
  wizardStepFactory: new StepsWizardWithoutReviewStepFactory(),
  getItemWithQuestionary(
    api: Sdk,
    sampleId: number
  ): Promise<ItemWithQuestionary | null> {
    return api.getSample({ sampleId }).then(({ sample }) => sample);
  },
};
