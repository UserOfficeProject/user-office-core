import { Tag } from '../models/Tag';

export function hasTag(tags: Tag[], shortCode: string): boolean {
  if (!tags || !Array.isArray(tags)) return false;

  return tags.some((t) => t.shortCode === shortCode);
}
