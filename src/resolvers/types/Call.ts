import {
  Ctx,
  Directive,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Call as CallOrigin } from '../../models/Call';
import { InstrumentWithAvailabilityTime } from './Instrument';
import { ProposalWorkflow } from './ProposalWorkflow';

@ObjectType()
@Directive('@key(fields: "id")')
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

  @Field(() => Date, { nullable: true })
  public startSEPReview: Date;

  @Field(() => Date, { nullable: true })
  public endSEPReview: Date;

  @Field(() => Date)
  public startNotify: Date;

  @Field(() => Date)
  public endNotify: Date;

  @Field(() => Date)
  public startCycle: Date;

  @Field(() => Date)
  public endCycle: Date;

  @Field({ nullable: true })
  public referenceNumberFormat: string;

  @Field(() => Int, { nullable: true })
  public proposalSequence: number;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  @Field(() => Int, { nullable: true })
  public proposalWorkflowId: number;

  @Field(() => Int, { nullable: true })
  public templateId?: number;
}

@Resolver(() => Call)
export class CallInstrumentsResolver {
  @FieldResolver(() => [InstrumentWithAvailabilityTime])
  async instruments(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.instrument.dataSource.getInstrumentsByCallId([
      call.id,
    ]);
  }

  @FieldResolver(() => ProposalWorkflow, { nullable: true })
  async proposalWorkflow(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.dataSource.getProposalWorkflow(
      call.proposalWorkflowId
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveCallReference(...params: any): Promise<Call> {
  // the order of the parameters and types are messed up,
  // it should be source, args, context, resolveInfo
  // but instead we get source, context and resolveInfo
  // this was the easies way to make the compiler happy and use real types
  const [reference, ctx]: [Pick<Call, 'id'>, ResolverContext] = params;

  // dataSource.get can be null, even with non-null operator the compiler complains
  return (await (ctx.queries.call.byRef(
    ctx.user,
    reference.id
  ) as unknown)) as Call;
}
