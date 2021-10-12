import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { GenericTemplateWithQuestionary } from './GenericTemplateWithQuestionary';
export class GenericTemplateSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public genericTemplate: GenericTemplateWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(stepIndex, isDirty, wizardSteps);
  }

  get itemWithQuestionary() {
    return this.genericTemplate;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.genericTemplate = { ...this.genericTemplate, ...item };
  }
}
