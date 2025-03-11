import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { Authorized } from '../decorators';
import { Event, EventLabel } from '../events/event.enum';
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
        .map((eventItem) => ({
          name: eventItem,
          description: EventLabel.get(eventItem),
        }));

      return allProposalEvents;
    } else if (entityType === WorkflowType.EXPERIMENT) {
      const allExperimentEvents = allEventsArray
        .filter((eventItem) => eventItem.startsWith('EXPERIMENT_'))
        .map((eventItem) => ({
          name: eventItem,
          description: EventLabel.get(eventItem),
        }));

      return allExperimentEvents;
    } else {
      return [];
    }
  }
}
