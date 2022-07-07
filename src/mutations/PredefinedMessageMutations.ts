import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PredefinedMessageDataSource } from '../datasources/PredefinedMessageDataSource';
import { Authorized } from '../decorators';
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

  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    input: CreatePredefinedMessageInput
  ) {
    return await this.predefinedMessageDataSource.create(agent, input);
  }

  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    input: UpdatePredefinedMessageInput
  ) {
    return await this.predefinedMessageDataSource.update(agent, input);
  }

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    input: DeletePredefinedMessageInput
  ) {
    return await this.predefinedMessageDataSource.delete(input);
  }
}
