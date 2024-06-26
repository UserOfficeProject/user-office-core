import { immerable } from 'immer';

import { Questionary, TemplateGroupId } from 'generated/sdk';

import { GenericTemplateWithQuestionary } from './GenericTemplateWithQuestionary';
import { QuestionarySubmissionState } from '../QuestionarySubmissionState';
export class GenericTemplateSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(public genericTemplate: GenericTemplateWithQuestionary) {
    super(TemplateGroupId.GENERIC_TEMPLATE, genericTemplate);
    this.stepIndex = this.getInitialStepIndex();
  }

  getItemId(): number {
    return this.genericTemplate.id;
  }
  get itemWithQuestionary() {
    return this.genericTemplate;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.genericTemplate = { ...this.genericTemplate, ...item };
  }
}
