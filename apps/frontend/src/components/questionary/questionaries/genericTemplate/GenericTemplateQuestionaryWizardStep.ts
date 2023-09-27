import { QuestionaryWizardStep } from 'components/questionary/DefaultWizardStepFactory';

export class GenericTemplateQuestionaryWizardStep extends QuestionaryWizardStep {
  isItemWithQuestionaryEditable(): boolean {
    return true; // Since view is locked when proposal is submitted, we can simply return true because edit genericTemplate will be disabled
  }
}
