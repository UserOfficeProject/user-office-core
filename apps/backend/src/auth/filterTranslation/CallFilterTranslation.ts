import { CallsFilter } from '../../resolvers/queries/CallsQuery';

type CallAuthFilters = Partial<Pick<CallsFilter, 'hasTag'>>;

export class CallFilterTranslation {
  constructor() {}

  async translateHasTagFilter(condition: string): Promise<CallAuthFilters> {
    const match = condition.match(/hasTag\([^)]*,\s*['"]([^'"]+)['"]\)/);

    if (!match) {
      throw new Error(`Could not parse hasTag condition: ${condition}`);
    }

    return {
      hasTag: match[1],
    };
  }
}
