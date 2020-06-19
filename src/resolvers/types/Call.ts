import {
  Field,
  Int,
  ObjectType,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Call as CallOrigin } from '../../models/Call';
import { Instrument } from './Instrument';

@ObjectType()
export class Call implements Partial<CallOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field(() => Date)
  public startCall: Date;

  @Field(() => Date)
  public endCall: Date;

  @Field(() => Date)
  public startReview: Date;

  @Field(() => Date)
  public endReview: Date;

  @Field(() => Date)
  public startNotify: Date;

  @Field(() => Date)
  public endNotify: Date;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  @Field(() => Int, { nullable: true })
  public templateId?: number;
}

@Resolver(() => Call)
export class CallInstrumentsResolver {
  @FieldResolver(() => [Instrument])
  async instruments(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.instrument.dataSource.getInstrumentsByCallId(
      call.id
    );
  }
}
