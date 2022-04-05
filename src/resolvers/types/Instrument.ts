import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
  Directive,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Instrument as InstrumentOrigin } from '../../models/Instrument';
import { isRejection } from '../../models/Rejection';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
@Directive('@key(fields: "id")')
export class Instrument implements Partial<InstrumentOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public name: string;

  @Field()
  public shortCode: string;

  @Field()
  public description: string;

  @Field(() => Int)
  public managerUserId: number;
}

@ObjectType()
export class InstrumentWithAvailabilityTime extends Instrument {
  @Field(() => Int, { nullable: true })
  public availabilityTime: number;

  @Field(() => Boolean, { defaultValue: false })
  public submitted: boolean;
}

@Resolver(() => Instrument)
export class InstrumentResolver {
  @FieldResolver(() => [BasicUserDetails])
  async scientists(
    @Root() instrument: Instrument,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[] | null> {
    const scientists =
      context.queries.instrument.dataSource.getInstrumentScientists(
        instrument.id
      );

    return isRejection(scientists) ? [] : scientists;
  }

  @FieldResolver(() => BasicUserDetails)
  async beamlineManager(
    @Root() instrument: Instrument,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(
      context.user,
      instrument.managerUserId
    );
  }
}

export async function resolveInstrumentReference(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...params: any
): Promise<Instrument | null> {
  // the order of the parameters and types are messed up,
  // it should be source, args, context, resolveInfo
  // but instead we get source, context and resolveInfo
  // this was the easies way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<Instrument, 'id'>, ResolverContext] = params;

  return await ctx.queries.instrument.byRef(ctx.user, reference.id);
}
