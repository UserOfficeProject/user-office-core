import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { TagDataSource } from '../../datasources/TagDataSource';
import { Call } from '../../models/Call';

export interface CallContextData extends Partial<Pick<Call, 'shortCode'>> {
  type: 'call';
  tags?: string[] | undefined;
}

@injectable()
export class CallContextFetcher {
  constructor(
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource,
    @inject(Tokens.TagDataSource) private tagDataSource: TagDataSource
  ) {}

  async fetchContextForCalls(
    callIds: number[]
  ): Promise<Map<number, CallContextData>> {
    const [calls, tags] = await Promise.all([
      this.callDataSource.getCalls({ callIds }),
      this.tagDataSource.getTagsForCalls(callIds),
    ]);

    const contextMap = new Map<number, CallContextData>();

    for (const call of calls) {
      const callCtx: CallContextData = {
        shortCode: call.shortCode,
        type: 'call',
        tags: tags ? tags.get(call.id)?.map((tag) => tag.shortCode) : undefined,
      };

      contextMap.set(call.id, callCtx);
    }

    return contextMap;
  }
}
