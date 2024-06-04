import {
  Query,
  Arg,
  Ctx,
  Resolver,
  Int,
  Field,
  ObjectType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { InstrumentWithAvailabilityTime } from '../types/Instrument';
import { Instrument } from '../types/Instrument';

@ObjectType()
class InstrumentsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Instrument])
  public instruments: Instrument[];
}

@Resolver()
export class InstrumentQuery {
  @Query(() => Instrument, { nullable: true })
  instrument(
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.get(context.user, instrumentId);
  }

  @Query(() => InstrumentsQueryResult, { nullable: true })
  instruments(
    @Arg('callIds', () => [Int], { nullable: true }) callIds: number[],
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.getAll(context.user, callIds);
  }

  @Query(() => [InstrumentWithAvailabilityTime], { nullable: true })
  instrumentsByFap(
    @Arg('fapId', () => Int) fapId: number,
    @Arg('callId', () => Int) callId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.getInstrumentsByFapId(context.user, {
      fapId,
      callId,
    });
  }

  @Query(() => [InstrumentWithAvailabilityTime], { nullable: true })
  instrumentsByIds(
    @Arg('instrumentIds', () => [Int]) instrumentIds: number[],
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.getInstrumentsByIds(
      context.user,
      instrumentIds
    );
  }

  @Query(() => InstrumentsQueryResult, { nullable: true })
  userInstruments(@Ctx() context: ResolverContext) {
    return context.queries.instrument.getUserInstruments(context.user);
  }

  @Query(() => Boolean, { nullable: true })
  async instrumentScientistHasInstrument(
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.queries.instrument.hasInstrumentScientistInstrument(
      context.user,
      instrumentId
    );
  }

  @Query(() => Boolean, { nullable: true })
  async instrumentScientistHasAccess(
    @Arg('instrumentId', () => Int) instrumentId: number,
    @Arg('proposalPk', () => Int) proposalPk: number,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.queries.instrument.hasInstrumentScientistAccess(
      context.user,
      instrumentId,
      proposalPk
    );
  }
}
