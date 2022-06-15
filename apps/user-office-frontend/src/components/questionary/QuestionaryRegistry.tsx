/* eslint-disable @typescript-eslint/ban-types */
import { Sdk, TemplateGroupId } from 'generated/sdk';
import { ItemWithQuestionary } from 'models/questionary/QuestionarySubmissionState';

import { StepDisplayElementFactory } from './DefaultStepDisplayElementFactory';
import { esiQuestionaryDefinition } from './questionaries/esi/EsiQuestionaryDefinition';
import { feedbackQuestionaryDefinition } from './questionaries/feedback/FeedbackQuestionaryDefinition';
import { genericTemplateQuestionaryDefinition } from './questionaries/genericTemplate/GenericTemplateQuestionaryDefinition';
import { proposalQuestionaryDefinition } from './questionaries/proposal/ProposalQuestionaryDefinition';
import { sampleQuestionaryDefinition } from './questionaries/sample/SampleQuestionaryDefinition';
import { sampleEsiQuestionaryDefinition } from './questionaries/sampleEsi/SampleEsiQuestionaryDefinition';
import { shipmentQuestionaryDefinition } from './questionaries/shipment/ShipmentQuestionaryDefinition';
import { visitRegistrationQuestionaryDefinition } from './questionaries/visitRegistration/VisitRegistrationQuestionaryDefinition';
import { WizardStepFactory } from './WizardStepFactory';

export interface QuestionaryDefinition {
  /**
   * The enum value from TemplateGroupId
   */
  readonly groupId: TemplateGroupId;

  /**
   * displayElementFactory
   */
  readonly displayElementFactory: StepDisplayElementFactory;

  /**
   * WizardStepFactory
   */
  readonly wizardStepFactory: WizardStepFactory;

  /**
   * Get ItemWithQuestionary
   * @param itemId
   */
  getItemWithQuestionary(
    api: Sdk,
    itemId: number | [number, number]
  ): Promise<ItemWithQuestionary | null>;
}

const registry = [
  esiQuestionaryDefinition,
  feedbackQuestionaryDefinition,
  genericTemplateQuestionaryDefinition,
  proposalQuestionaryDefinition,
  sampleEsiQuestionaryDefinition,
  sampleQuestionaryDefinition,
  shipmentQuestionaryDefinition,
  visitRegistrationQuestionaryDefinition,
];

Object.freeze(registry);

const questionaryDefinitionMap = new Map<
  TemplateGroupId,
  QuestionaryDefinition
>();
registry.forEach((definition) =>
  questionaryDefinitionMap.set(definition.groupId, definition)
);

export function getQuestionaryDefinition(id: TemplateGroupId) {
  const definition = questionaryDefinitionMap.get(id);
  if (!definition) {
    throw new Error(`Definition for ${id} was not found`);
  }

  return definition;
}
