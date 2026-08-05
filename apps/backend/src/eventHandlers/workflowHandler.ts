import { container } from 'tsyringe';

import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { searchObjectByKey } from '../utils/helperFunctions';
import { WorkflowEngine, WorkflowEngineType } from '../workflowEngine';
import experimentSafetyWorkflowEntity from './workflowEntities/experiment';
import proposalWorkflowEntity from './workflowEntities/proposal';

type EntityKey = string;

export interface WorkFlowEntity {
  name: string;
  extractionEntityKeys: EntityKey[];
  exemptedEvents: Event[];
  resolveWorkflowId: (entityId: number) => Promise<number | undefined>;
  resolveCurrentStatusId: (entityId: number) => Promise<number | undefined>;
  updateWorkflowStatus: (
    entityId: number,
    workflowStatusId: number
  ) => Promise<void>;
  onWorkflowStatusChange: (
    updatedEntities: WorkflowEngineType[]
  ) => Promise<void>;
}

const extractEntityFromEvent = (
  event: ApplicationEvent,
  entityKeys: EntityKey[]
) => {
  let entity, entityKey;

  for (const key of entityKeys) {
    entity = searchObjectByKey(event, key);
    if (entity && entity[key]) {
      entityKey = key;

      return { entity, entityKey };
    }
  }

  return null;
};

export const startWorkflow = async (
  event: ApplicationEvent,
  entityIdentifier: number | number[],
  workflowEntity: WorkFlowEntity
) => {
  const isArray = Array.isArray(entityIdentifier);

  const workflowEngine = container.resolve(WorkflowEngine);
  const updatedEntities = await workflowEngine.run(
    {
      event: event.type,
      entities: isArray ? entityIdentifier : [entityIdentifier],
    },
    workflowEntity
  );

  if (!updatedEntities || updatedEntities.length === 0) {
    return updatedEntities;
  }

  await workflowEntity.onWorkflowStatusChange(updatedEntities);

  return updatedEntities;
};

function isValidWorkflowEntityValue(
  value: unknown
): value is number | number[] {
  if (!value) return false;
  if (Array.isArray(value)) {
    if (value.length === 0) return false;

    return value.every((item) => typeof item === 'number');
  }

  return typeof value === 'number';
}

export default function workflowHandler() {
  const entities = [proposalWorkflowEntity, experimentSafetyWorkflowEntity];

  return async (event: ApplicationEvent) => {
    if (event.isRejection) {
      return;
    }
    for (const entity of entities) {
      if (entity.exemptedEvents.includes(event.type)) {
        continue;
      }
      const { extractionEntityKeys } = entity;
      const extractedEntity = extractEntityFromEvent(
        event,
        extractionEntityKeys
      );
      if (extractedEntity) {
        const { entity: extractedEntityObject, entityKey: extractedEntityKey } =
          extractedEntity;

        const extractedEntityValue = extractedEntityObject[extractedEntityKey];
        if (
          extractedEntityValue &&
          isValidWorkflowEntityValue(extractedEntityValue)
        ) {
          await startWorkflow(event, extractedEntityValue, entity);
        }
      }
    }
  };
}
