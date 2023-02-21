import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PredefinedMessageDataSource } from '../datasources/PredefinedMessageDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreatePredefinedMessageInput } from '../resolvers/mutations/predefinedMessages/CreatePredefinedMessageMutation';
import { DeletePredefinedMessageInput } from '../resolvers/mutations/predefinedMessages/DeletePredefinedMessageMutation';
import { UpdatePredefinedMessageInput } from '../resolvers/mutations/predefinedMessages/UpdatePredefinedMessageMutation';

@injectable()
export default class PredefinedMessageMutations {
  constructor(
    @inject(Tokens.PredefinedMessageDataSource)
    private predefinedMessageDataSource: PredefinedMessageDataSource
  ) {}

  @EventBus(Event.PREDEFINED_MESSAGE_CREATED)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    input: CreatePredefinedMessageInput
  ) {
    return await this.predefinedMessageDataSource.create(agent, input);
  }

  @EventBus(Event.PREDEFINED_MESSAGE_UPDATED)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    input: UpdatePredefinedMessageInput
  ) {
    return await this.predefinedMessageDataSource.update(agent, input);
  }

  @EventBus(Event.PREDEFINED_MESSAGE_DELETED)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    input: DeletePredefinedMessageInput
  ) {
    const deletedMessage = await this.predefinedMessageDataSource.delete(input);

    if (!deletedMessage) {
      throw rejection('Could not delete predefined message');
    }

    return deletedMessage;
  }
}
