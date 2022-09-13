import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PredefinedMessageDataSource } from '../datasources/PredefinedMessageDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { PredefinedMessagesFilter } from '../resolvers/queries/PredefinedMessageQuery';

@injectable()
export default class PredefinedMessageQueries {
  constructor(
    @inject(Tokens.PredefinedMessageDataSource)
    public dataSource: PredefinedMessageDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, predefinedMessageId: number) {
    const predefinedMessage = await this.dataSource.get(predefinedMessageId);

    return predefinedMessage;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null, filter: PredefinedMessagesFilter) {
    const predefinedMessages = await this.dataSource.getAll(filter);

    return predefinedMessages;
  }
}
