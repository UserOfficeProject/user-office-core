/* eslint-disable @typescript-eslint/ban-types */
import { TemplateGroupId } from 'generated/sdk';

import { StepDisplayElementFactory } from './DefaultStepDisplayElementFactory';
import { esiQuestionaryDefinition } from './questionaries/esi/EsiQuestionaryDefinition';
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
}

const registry = [
  proposalQuestionaryDefinition,
  sampleQuestionaryDefinition,
  shipmentQuestionaryDefinition,
  visitRegistrationQuestionaryDefinition,
  genericTemplateQuestionaryDefinition,
  esiQuestionaryDefinition,
  sampleEsiQuestionaryDefinition,
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
