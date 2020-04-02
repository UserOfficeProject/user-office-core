import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';
import * as yup from 'yup';

import { ResolverContext } from '../../context';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/EventBusDecorator';
import { ValidateArgs } from '../../utils/ValidateArgs';
import { SEPResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateSEPArgs {
  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Int, { defaultValue: 2 })
  public numberRatingsRequired: number;

  @Field(() => Boolean)
  public active: boolean;
}

const createSEPValidationSchema = yup.object().shape({
  code: yup.string().required(),
  description: yup.string().required(),
  numberRatingsRequired: yup.number().min(2),
});

@Resolver()
export class CreateSEPMutation {
  @ValidateArgs(createSEPValidationSchema)
  @EventBus(Event.SEP_CREATED)
  @Mutation(() => SEPResponseWrap)
  async createSEP(
    @Args() args: CreateSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.create(context.user, args),
      SEPResponseWrap
    );
  }
}
