import { PredefinedMessage } from '../models/PredefinedMessage';
import { UserWithRole } from '../models/User';
import { CreatePredefinedMessageInput } from '../resolvers/mutations/predefinedMessages/CreatePredefinedMessageMutation';
import { DeletePredefinedMessageInput } from '../resolvers/mutations/predefinedMessages/DeletePredefinedMessageMutation';
import { UpdatePredefinedMessageInput } from '../resolvers/mutations/predefinedMessages/UpdatePredefinedMessageMutation';
import { PredefinedMessagesFilter } from '../resolvers/queries/PredefinedMessageQuery';

export interface PredefinedMessageDataSource {
  create(
    agent: UserWithRole | null,
    input: CreatePredefinedMessageInput
  ): Promise<PredefinedMessage>;
  get(id: number): Promise<PredefinedMessage | null>;
  getAll(filter: PredefinedMessagesFilter): Promise<PredefinedMessage[]>;
  update(
    agent: UserWithRole | null,
    input: UpdatePredefinedMessageInput
  ): Promise<PredefinedMessage>;
  delete(
    input: DeletePredefinedMessageInput
  ): Promise<PredefinedMessage | null>;
}
