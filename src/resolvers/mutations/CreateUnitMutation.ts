import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UnitResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateUnitArgs {
  @Field(() => String)
  name: string;
}

@Resolver()
export class CreateUnitMutation {
  @Mutation(() => UnitResponseWrap)
  createUnit(@Args() args: CreateUnitArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.admin.createUnit(context.user, args),
      UnitResponseWrap
    );
  }
}
