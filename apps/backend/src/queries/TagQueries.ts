import { injectable, inject } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import TagDataSource from '../datasources/postgres/TagDataSource';
import { Tag } from '../models/Tag';

@injectable()
export default class TagQueries {
  constructor(
    @inject(Tokens.TagDataSource)
    public dataSource: TagDataSource
  ) {}

  async getTags(ids: number[] | null): Promise<Tag[]> {
    return this.dataSource.getTags(ids);
  }
}
