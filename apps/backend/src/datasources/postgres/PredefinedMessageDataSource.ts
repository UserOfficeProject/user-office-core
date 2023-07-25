import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { PredefinedMessage } from '../../models/PredefinedMessage';
import { UserWithRole } from '../../models/User';
import { CreatePredefinedMessageInput } from '../../resolvers/mutations/predefinedMessages/CreatePredefinedMessageMutation';
import { DeletePredefinedMessageInput } from '../../resolvers/mutations/predefinedMessages/DeletePredefinedMessageMutation';
import { UpdatePredefinedMessageInput } from '../../resolvers/mutations/predefinedMessages/UpdatePredefinedMessageMutation';
import { PredefinedMessagesFilter } from '../../resolvers/queries/PredefinedMessageQuery';
import { PredefinedMessageDataSource } from '../PredefinedMessageDataSource';
import database from './database';
import {
  createPredefinedMessageObject,
  PredefinedMessageRecord,
} from './records';

@injectable()
export default class PostgresPredefinedMessageDataSource
  implements PredefinedMessageDataSource
{
  async create(
    agent: UserWithRole | null,
    input: CreatePredefinedMessageInput
  ): Promise<PredefinedMessage> {
    const lastModifiedBy = agent?.id;
    const dateModified = new Date();

    const [predefinedMessageRecord]: PredefinedMessageRecord[] = await database
      .insert({
        title: input.title,
        key: input.key,
        message: input.message,
        date_modified: dateModified,
        last_modified_by: lastModifiedBy,
      })
      .into('predefined_messages')
      .returning('*');

    if (!predefinedMessageRecord) {
      throw new GraphQLError('Could not create predefined message');
    }

    return createPredefinedMessageObject(predefinedMessageRecord);
  }

  async get(id: number): Promise<PredefinedMessage | null> {
    return database
      .select()
      .from('predefined_messages')
      .where('predefined_message_id', id)
      .first()
      .then((predefinedMessage: PredefinedMessageRecord | null) =>
        predefinedMessage
          ? createPredefinedMessageObject(predefinedMessage)
          : null
      );
  }

  async getAll(filter: PredefinedMessagesFilter): Promise<PredefinedMessage[]> {
    return database
      .select('*')
      .from('predefined_messages')
      .modify((query) => {
        if (filter.key) {
          query.where('key', filter.key);
        } else {
          // NOTE: If there is no key provided(which shouldn't be the case) set to "general".
          query.where('key', 'general');
        }
      })
      .then((predefinedMessages: PredefinedMessageRecord[]) =>
        predefinedMessages.map((predefinedMessage) =>
          createPredefinedMessageObject(predefinedMessage)
        )
      );
  }

  async update(
    agent: UserWithRole | null,
    input: UpdatePredefinedMessageInput
  ): Promise<PredefinedMessage> {
    const lastModifiedBy = agent?.id;
    const dateModified = new Date();

    const [predefinedMessageRecord]: PredefinedMessageRecord[] = await database(
      'predefined_messages'
    )
      .update({
        title: input.title,
        key: input.key,
        message: input.message,
        date_modified: dateModified,
        last_modified_by: lastModifiedBy,
      })
      .where('predefined_message_id', input.id)
      .returning('*');

    if (!predefinedMessageRecord) {
      throw new GraphQLError('Could not update predefined message');
    }

    return createPredefinedMessageObject(predefinedMessageRecord);
  }

  async delete(
    input: DeletePredefinedMessageInput
  ): Promise<PredefinedMessage | null> {
    const [predefinedMessageRecord]: PredefinedMessageRecord[] = await database(
      'predefined_messages'
    )
      .where('predefined_message_id', input.id)
      .del()
      .returning('*');

    if (!predefinedMessageRecord) {
      return null;
    }

    return createPredefinedMessageObject(predefinedMessageRecord);
  }
}
