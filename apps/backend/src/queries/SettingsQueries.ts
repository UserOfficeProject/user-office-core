import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { Authorized } from '../decorators';
import { Event, EventMetadataByEvent } from '../events/event.enum';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { WorkflowType } from '../models/Workflow';

@injectable()
export default class SettingsQueries {
  constructor() {}
  @Authorized([Roles.USER_OFFICER])
  async getAllEvents(agent: UserWithRole | null, entityType: WorkflowType) {
    const allEventsArray = Object.values(Event);

    if (entityType === WorkflowType.PROPOSAL) {
      const allProposalEvents = allEventsArray
        .filter(
          (eventItem) =>
            eventItem.startsWith('PROPOSAL_') || eventItem.startsWith('CALL_')
        )
        .map((eventItem) => {
          const metadata = EventMetadataByEvent.get(eventItem as Event);

          return {
            name: eventItem,
            description: metadata?.label,
          };
        });

      return allProposalEvents;
    } else if (entityType === WorkflowType.EXPERIMENT) {
      const allExperimentSafetyEvents = allEventsArray
        .filter((eventItem) => eventItem.startsWith('EXPERIMENT_'))
        .map((eventItem) => {
          const metadata = EventMetadataByEvent.get(eventItem as Event);

          return {
            name: eventItem,
            description: metadata?.label,
          };
        });

      return allExperimentSafetyEvents;
    } else {
      return [];
    }
  }
}
