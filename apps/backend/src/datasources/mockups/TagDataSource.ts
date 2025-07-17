import { Call } from '../../models/Call';
import { Instrument } from '../../models/Instrument';
import { Tag } from '../../models/Tag';
import { TagDataSource } from '../TagDataSource';

export class TagDataSourceMock implements TagDataSource {
  async getCallsTags(callId: number | null): Promise<Tag[]> {
    return [];
  }
  getInstrumentsTags(instrumentId: number | null): Promise<Tag[]> {
    throw new Error('Method not implemented.');
  }
  addCallsToTag(callIds: number[], tagId: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  removeCallFromTag(callId: number, tagId: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getTagCalls(tagId: number): Promise<Call[]> {
    throw new Error('Method not implemented.');
  }
  getTags(ids: number[] | null): Promise<Tag[]> {
    throw new Error('Method not implemented.');
  }
  createTag(name: string, shortCode: string): Promise<Tag> {
    throw new Error('Method not implemented.');
  }
  updateTag(id: number, name: string, shortCode: string): Promise<Tag> {
    throw new Error('Method not implemented.');
  }
  deleteTag(id: number): Promise<Tag> {
    throw new Error('Method not implemented.');
  }
  addInstrumentsToTag(
    instrumentIds: number[],
    tagId: number
  ): Promise<boolean> {
    return Promise.resolve(true);
  }
  removeInstrumentFromTag(
    instrumentId: number,
    tagId: number
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getTagInstruments(tagId: number): Promise<Instrument[]> {
    throw new Error('Method not implemented.');
  }
  getTagsByNames(tagNames: string[]): Promise<Tag[]> {
    return Promise.resolve([new Tag(0, 'ISIS Tag', 'ISIS')]);
  }
}
