import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TagDataSource } from '../datasources/TagDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { Tag } from '../models/Tag';
import { UserWithRole } from '../models/User';
import {
  AssignCallsToTagArgs,
  RemoveCallFromTagArgs,
} from '../resolvers/mutations/AssignCallsToTag';
import {
  AssignInstrumentsToTagArgs,
  RemoveInstrumentFromTagArgs,
} from '../resolvers/mutations/AssignInstrumentsToTag';

@injectable()
export default class TagMutations {
  constructor(
    @inject(Tokens.TagDataSource)
    public dataSource: TagDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createTag(
    agent: UserWithRole | null,
    data: { name: string; shortCode: string }
  ): Promise<Tag> {
    return this.dataSource.createTag(data.name, data.shortCode);
  }

  @Authorized([Roles.USER_OFFICER])
  async updateTag(
    agent: UserWithRole | null,
    data: { id: number; name: string; shortCode: string }
  ): Promise<Tag | null> {
    return this.dataSource.updateTag(data.id, data.name, data.shortCode);
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteTag(agent: UserWithRole | null, id: number): Promise<Tag> {
    return this.dataSource.deleteTag(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async addInstrumentsToTag(
    agent: UserWithRole | null,
    args: AssignInstrumentsToTagArgs
  ): Promise<boolean> {
    return this.dataSource.addInstrumentsToTag(args.instrumentIds, args.tagId);
  }

  @Authorized([Roles.USER_OFFICER])
  async removeInstrumentFromTag(
    agent: UserWithRole | null,
    args: RemoveInstrumentFromTagArgs
  ): Promise<boolean> {
    return this.dataSource.removeInstrumentFromTag(
      args.instrumentId,
      args.tagId
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async addCallsToTag(
    agent: UserWithRole | null,
    args: AssignCallsToTagArgs
  ): Promise<boolean> {
    return this.dataSource.addCallsToTag(args.callIds, args.tagId);
  }

  @Authorized([Roles.USER_OFFICER])
  async removeCallFromTag(
    agent: UserWithRole | null,
    args: RemoveCallFromTagArgs
  ): Promise<boolean> {
    return this.dataSource.removeCallFromTag(args.callId, args.tagId);
  }
}
