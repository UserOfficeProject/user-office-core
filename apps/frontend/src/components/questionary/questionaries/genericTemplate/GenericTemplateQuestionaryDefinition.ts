import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { GenericTemplateStepDisplayElementFactory } from './GenericTemplateStepDisplayElementFactory';
import { GenericTemplateWizardStepFactory } from './GenericTemplateWizardStepFactory';
import { QuestionaryDefinition } from '../../QuestionaryRegistry';

export const genericTemplateQuestionaryDefinition: QuestionaryDefinition = {
  groupId: TemplateGroupId.GENERIC_TEMPLATE,
  displayElementFactory: new GenericTemplateStepDisplayElementFactory(),
  wizardStepFactory: new GenericTemplateWizardStepFactory(),
  getItemWithQuestionary(
    api: Sdk,
    genericTemplateId: number
  ): Promise<ItemWithQuestionary | null> {
    return api
      .getGenericTemplate({ genericTemplateId })
      .then(({ genericTemplate }) => genericTemplate);
  },
};
