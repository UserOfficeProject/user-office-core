import { injectable } from 'tsyringe';

import { PredefinedMessage } from '../../models/PredefinedMessage';
import { UserWithRole } from '../../models/User';
import { CreatePredefinedMessageInput } from '../../resolvers/mutations/predefinedMessages/CreatePredefinedMessageMutation';
import { DeletePredefinedMessageInput } from '../../resolvers/mutations/predefinedMessages/DeletePredefinedMessageMutation';
import { UpdatePredefinedMessageInput } from '../../resolvers/mutations/predefinedMessages/UpdatePredefinedMessageMutation';
import { PredefinedMessagesFilter } from '../../resolvers/queries/PredefinedMessageQuery';
import { PredefinedMessageDataSource } from '../PredefinedMessageDataSource';

const dummyPredefinedMessage = new PredefinedMessage(
  1,
  'Test message',
  'This is test message',
  new Date(),
  1
);

@injectable()
export default class PredefinedMessageDataSourceMock
  implements PredefinedMessageDataSource
{
  async create(
    agent: UserWithRole | null,
    input: CreatePredefinedMessageInput
  ): Promise<PredefinedMessage> {
    return { ...dummyPredefinedMessage, ...input };
  }

  async get(id: number): Promise<PredefinedMessage | null> {
    return dummyPredefinedMessage;
  }

  async getAll(filter: PredefinedMessagesFilter): Promise<PredefinedMessage[]> {
    return [dummyPredefinedMessage];
  }

  async update(
    agent: UserWithRole | null,
    input: UpdatePredefinedMessageInput
  ): Promise<PredefinedMessage> {
    return { ...dummyPredefinedMessage, ...input };
  }

  async delete(
    input: DeletePredefinedMessageInput
  ): Promise<PredefinedMessage | null> {
    return dummyPredefinedMessage;
  }
}
