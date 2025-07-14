import { Call } from '../models/Call';
import { Instrument } from '../models/Instrument';
import { Tag } from '../models/Tag';

export interface TagDataSource {
  getTags(ids: number[] | null): Promise<Tag[]>;
  createTag(name: string, shortCode: string): Promise<Tag>;
  updateTag(id: number, name: string, shortCode: string): Promise<Tag>;
  deleteTag(id: number): Promise<Tag>;
  addInstrumentsToTag(instrumentIds: number[], tagId: number): Promise<boolean>;
  removeInstrumentFromTag(
    instrumentId: number,
    tagId: number
  ): Promise<boolean>;
  addCallsToTag(callIds: number[], tagId: number): Promise<boolean>;
  removeCallFromTag(callId: number, tagId: number): Promise<boolean>;
  getTagInstruments(tagId: number): Promise<Instrument[]>;
  getTagCalls(tagId: number): Promise<Call[]>;
  getTagsByNames(tagNames: string[]): Promise<Tag[]>;
  getCallsTags(callId: number | null): Promise<Tag[]>;
  getInstrumentsTags(instrumentId: number | null): Promise<Tag[]>;
}
