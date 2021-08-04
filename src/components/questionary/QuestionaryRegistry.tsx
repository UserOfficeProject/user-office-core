/* eslint-disable @typescript-eslint/ban-types */
import { TemplateCategoryId } from 'generated/sdk';

import { StepDisplayElementFactory } from './DefaultStepDisplayElementFactory';
import { proposalQuestionaryDefinition } from './questionaries/proposal/ProposalQuestionaryDefinition';
import { sampleQuestionaryDefinition } from './questionaries/sample/SampleQuestionaryDefinition';
import { shipmentQuestionaryDefinition } from './questionaries/shipment/ShipmentQuestionaryDefinition';
import { visitRegistrationQuestionaryDefinition } from './questionaries/visitRegistration/VisitRegistrationQuestionaryDefinition';
import { WizardStepFactory } from './WizardStepFactory';

export interface QuestionaryDefinition {
  /**
   * The enum value from TemplateCategoryId
   */
  readonly categoryId: TemplateCategoryId;

  /**
   * displayElementFactory
   */
  readonly displayElementFactory: StepDisplayElementFactory;

  /**
   * WizardStepFactory
   */
  readonly wizardStepFactory: WizardStepFactory;
}

const registry = [
  proposalQuestionaryDefinition,
  sampleQuestionaryDefinition,
  shipmentQuestionaryDefinition,
  visitRegistrationQuestionaryDefinition,
];

Object.freeze(registry);

const questionaryDefinitionMap = new Map<
  TemplateCategoryId,
  QuestionaryDefinition
>();
registry.forEach((definition) =>
  questionaryDefinitionMap.set(definition.categoryId, definition)
);

export function getQuestionaryDefinition(id: TemplateCategoryId) {
  const definition = questionaryDefinitionMap.get(id);
  if (!definition) {
    throw new Error(`Definition for ${id} was not found`);
  }

  return definition;
}
