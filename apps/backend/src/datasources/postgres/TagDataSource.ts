import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Call } from '../../models/Call';
import { Instrument } from '../../models/Instrument';
import { Tag } from '../../models/Tag';
import { TagDataSource } from '../TagDataSource';
import { UserDataSource } from '../UserDataSource';
import database from './database';
import {
  createTagObject,
  createInstrumentObject,
  TagRecord,
  InstrumentRecord,
  createCallObject,
} from './records';

@injectable()
class PostgresTagDataSource implements TagDataSource {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource
  ) {}

  async getTags(ids: number[] | null): Promise<Tag[]> {
    const tags: TagRecord[] = await database<TagRecord>('tag')
      .select('*')
      .modify((query) => {
        if (ids) query.whereIn('tag_id', ids);
      });

    return tags.map(createTagObject);
  }

  async createTag(name: string, shortCode: string): Promise<Tag> {
    const [tag] = await database<TagRecord>('tag')
      .insert({ name, short_code: shortCode })
      .returning('*');

    return createTagObject(tag);
  }

  async updateTag(id: number, name: string, shortCode: string): Promise<Tag> {
    const [tag] = await database<TagRecord>('tag')
      .where('tag_id', id)
      .update({ name, short_code: shortCode })
      .returning('*');

    return createTagObject(tag);
  }

  async deleteTag(id: number): Promise<Tag> {
    const [tag] = await database<TagRecord>('tag')
      .where('tag_id', id)
      .del()
      .returning('*');

    return createTagObject(tag);
  }

  async addInstrumentsToTag(
    instrumentIds: number[],
    tagId: number
  ): Promise<boolean> {
    const dataToInsert = instrumentIds.map((instrumentId) => ({
      tag_id: tagId,
      instrument_id: instrumentId,
    }));

    const result = await database('tag_instrument').insert(dataToInsert);

    return result.length > 0;
  }

  async removeInstrumentFromTag(
    instrumentId: number,
    tagId: number
  ): Promise<boolean> {
    const result = await database('tag_instrument')
      .where({ instrument_id: instrumentId, tag_id: tagId })
      .del();

    return result > 0;
  }

  async addCallsToTag(callIds: number[], tagId: number): Promise<boolean> {
    const dataToInsert = callIds.map((callId) => ({
      tag_id: tagId,
      call_id: callId,
    }));

    const result = await database('tag_call').insert(dataToInsert);

    return result.length > 0;
  }
  async removeCallFromTag(callId: number, tagId: number): Promise<boolean> {
    const result = await database('tag_call')
      .where({ call_id: callId, tag_id: tagId })
      .del();

    return result > 0;
  }

  async getTagInstruments(tagId: number): Promise<Instrument[]> {
    const instruments = await database<InstrumentRecord>('tag_instrument as fi')
      .join('instruments as i', 'fi.instrument_id', 'i.instrument_id')
      .where('tag_id', tagId)
      .select('i.*');

    return instruments.map(createInstrumentObject);
  }

  async getTagCalls(tagId: number): Promise<Call[]> {
    const calls = await database('tag_call as fc')
      .join('call as c', 'fc.call_id', 'c.call_id')
      .where('fc.tag_id', tagId)
      .select('c.*');

    return calls.map(createCallObject);
  }

  async getTagsByNames(tagNames: string[]): Promise<Tag[]> {
    const tags = await database<TagRecord>('tag')
      .whereIn('short_code', tagNames)
      .select('*');

    return tags.map(createTagObject);
  }

  async getCallsTags(callId: number | null): Promise<Tag[]> {
    const tags: TagRecord[] = await database<TagRecord>('tag_call as fc')
      .join('tag as f', 'fc.tag_id', 'f.tag_id')
      .where('fc.call_id', callId)
      .select('f.*');

    return tags.map(createTagObject);
  }

  async getInstrumentsTags(instrumentId: number | null): Promise<Tag[]> {
    const tags: TagRecord[] = await database<TagRecord>('tag_instrument as fi')
      .join('tag as f', 'fi.tag_id', 'f.tag_id')
      .where('fi.instrument_id', instrumentId)
      .select('f.*');

    return tags.map(createTagObject);
  }
}

export default PostgresTagDataSource;
