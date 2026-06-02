import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  EventLogsDataSource,
  EventLogFilter,
} from '../datasources/EventLogsDataSource';
import { Authorized } from '../decorators';
import { ProposalReaderRoleConfig, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class EventLogQueries {
  constructor(
    @inject(Tokens.EventLogsDataSource) private dataSource: EventLogsDataSource
  ) {}

  // NOTE: * is used when we want to get all event logs without applying any filter
  @Authorized([Roles.USER_OFFICER, Roles.PROPOSAL_READER])
  async getAll(
    agent: UserWithRole | null,
    filter: EventLogFilter = { changedObjectId: '*', eventType: '*' }
  ) {
    if (agent?.currentRole?.shortCode === Roles.PROPOSAL_READER) {
      const hasLogAccess = (
        agent.currentRole.config as ProposalReaderRoleConfig
      ).hasLogAccess;
      if (!hasLogAccess) {
        logger.logError('Unauthorized access to event logs', {
          userId: agent.id,
          roleId: agent.currentRole.id,
        });

        return null;
      }
    }

    return await this.dataSource.get(filter);
  }
}
