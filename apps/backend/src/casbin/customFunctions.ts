import { Tag } from '../models/Tag';

export function hasTag(tag: Tag | undefined, shortCode: string): boolean {
  return tag !== undefined && tag.shortCode === shortCode;
}
