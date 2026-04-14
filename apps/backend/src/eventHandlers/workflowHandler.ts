import { container } from 'tsyringe';

import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { searchObjectByKey } from '../utils/helperFunctions';
import { WorkflowEngine } from '../workflowEngine';
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
    entityId: number,
    prevStatusId: number,
    nextStatusId: number
  ) => Promise<void>;
}

const extractEntityFromEvent = (
  event: ApplicationEvent,
  entityKeys: EntityKey[]
) => {
  let entity, entityKey;

  // NOTE: Go through the event object and try to find some of the ProposalInformationKeys.
  for (const key of entityKeys) {
    entity = searchObjectByKey(event, key);

    if (entity && entity[key as keyof object]) {
      entityKey = key;

      return { entity, entityKey };
    } else {
      return null;
    }
  }
};

const startWorkflow = async (
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

  await Promise.all(
    updatedEntities.map(async (updatedEntity) => {
      await workflowEntity.onWorkflowStatusChange(
        updatedEntity.entityId,
        updatedEntity.prevStatusId,
        updatedEntity.nextStatusId
      );
    })
  );

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
      const { extractionEntityKeys } = entity;

      const extractedEntity = extractEntityFromEvent(
        event,
        extractionEntityKeys
      );

      if (extractedEntity) {
        const { entity: extractedEntityObject, entityKey: extractedEntityKey } =
          extractedEntity;

        const extractedEntityValue =
          extractedEntityObject[extractedEntityKey as keyof object];

        if (isValidWorkflowEntityValue(extractedEntityValue)) {
          await startWorkflow(event, extractedEntityValue, entity);
        }
      }
    }
  };
}
