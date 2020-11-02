import {
    Arg,
    Ctx,
    Mutation,
    Resolver,
    Field,
    ArgsType,
    Args,
    Int,
  } from 'type-graphql';

  import { ResolverContext } from '../../context';
  import { CheckExternalTokenWrap } from '../types/CommonWrappers';
  import { wrapResponse } from '../wrapResponse';

  @Resolver()
  export class CheckExternalMutation {
    @Mutation(() => CheckExternalTokenWrap)
    checkExternalToken(@Arg('externalToken') externalToken: string, @Ctx() context: ResolverContext) {
      return wrapResponse(context.mutations.user.checkExternalToken(externalToken), CheckExternalTokenWrap);
    }
  }
