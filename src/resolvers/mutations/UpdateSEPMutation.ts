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
export class UpdateSEPArgs {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public code: string;

  @Field(() => String)
  public description: string;

  @Field(() => Int, { defaultValue: 2 })
  public numberRatingsRequired: number;

  @Field(() => Boolean)
  public active: boolean;
}

const updateSEPValidationSchema = yup.object().shape({
  id: yup.number().required(),
  code: yup.string().required(),
  description: yup.string().required(),
  numberRatingsRequired: yup.number().min(2),
});

@Resolver()
export class UpdateSEPMutation {
  @ValidateArgs(updateSEPValidationSchema)
  @EventBus(Event.SEP_UPDATED)
  @Mutation(() => SEPResponseWrap)
  async updateSEP(
    @Args() args: UpdateSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.update(context.user, args),
      SEPResponseWrap
    );
  }
}
