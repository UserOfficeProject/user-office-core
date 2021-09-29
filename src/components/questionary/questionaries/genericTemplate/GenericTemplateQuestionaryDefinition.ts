import { TemplateCategoryId } from 'generated/sdk';

import { QuestionaryDefinition } from '../../QuestionaryRegistry';
import { GenericTemplateStepDisplayElementFactory } from './GenericTemplateStepDisplayElementFactory';
import { GenericTemplateWizardStepFactory } from './GenericTemplateWizardStepFactory';

export const genericTemplateQuestionaryDefinition: QuestionaryDefinition = {
  categoryId: TemplateCategoryId.GENERIC_TEMPLATE,
  displayElementFactory: new GenericTemplateStepDisplayElementFactory(),
  wizardStepFactory: new GenericTemplateWizardStepFactory(),
};
