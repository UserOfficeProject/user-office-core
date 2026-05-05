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

import { BasicUserDetails } from './BasicUserDetails';
import { Fap } from './Fap';
import { Tag } from './Tag';
import { ResolverContext } from '../../context';
import { Instrument as InstrumentOrigin } from '../../models/Instrument';
import { isRejection } from '../../models/Rejection';

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

  @Field(() => Boolean, { nullable: true })
  public selectable?: boolean;

  @Field(() => Boolean, { nullable: true })
  multipleTechReviewsEnabled?: boolean;
}

@ObjectType()
export class InstrumentWithAvailabilityTime extends Instrument {
  @Field(() => Int, { nullable: true })
  public availabilityTime: number;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  public submitted?: boolean;

  @Field(() => Int, { nullable: true })
  public fapId: number;
}

@ObjectType()
export class InstrumentWithManagementTime extends Instrument {
  @Field(() => Int, { nullable: true })
  public managementTimeAllocation: number;
}

@Resolver(() => InstrumentWithAvailabilityTime)
export class InstrumentWithAvailabilityTimeResolver {
  @FieldResolver(() => Fap, { nullable: true })
  async fap(
    @Root() instrument: InstrumentWithAvailabilityTime,
    @Ctx() context: ResolverContext
  ): Promise<Fap | null> {
    return (await instrument.fapId)
      ? context.queries.fap.dataSource.getFap(instrument.fapId)
      : null;
  }
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

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async instrumentContact(
    @Root() instrument: Instrument,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(
      context.user,
      instrument.managerUserId
    );
  }

  @FieldResolver(() => [Tag], { nullable: true })
  async tags(
    @Root() instrument: Instrument,
    @Ctx() context: ResolverContext
  ): Promise<Tag[] | null> {
    const tags = context.queries.tag.dataSource.getInstrumentsTags(
      instrument.id
    );

    return isRejection(tags) ? [] : tags;
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
