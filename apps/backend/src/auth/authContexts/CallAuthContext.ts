import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { TagDataSource } from '../../datasources/TagDataSource';
import { AuthContext } from '../AuthRegistry';

export interface CallContextData extends AuthContext {
  type: 'call';
  id: number;
  shortCode: string;
  tags: string[];
}

export const CALL_AUTH_UI_ATTRIBUTES: Array<keyof CallContextData> = [
  'id',
  'shortCode',
  'tags',
];

@injectable()
export class CallAuthContext {
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
        type: 'call',
        id: call.id,
        shortCode: call.shortCode,
        tags: tags.get(call.id)?.map((tag) => tag.shortCode) || [],
      };

      contextMap.set(call.id, callCtx);
    }

    return contextMap;
  }
}
