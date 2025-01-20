import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { Event, EventLabel } from '../events/event.enum';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class ProposalSettingsQueries {
  constructor(
    @inject(Tokens.ProposalSettingsDataSource)
    public dataSource: ProposalSettingsDataSource,
    @inject(Tokens.StatusActionsDataSource)
    public statusActionsDataSource: StatusActionsDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getAllProposalEvents(agent: UserWithRole | null) {
    const allEventsArray = Object.values(Event);
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
  }
}
