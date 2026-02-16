import { container } from 'tsyringe';
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
import TemplateDataSource from '../../datasources/postgres/TemplateDataSource';
import { AllocationTimeUnits, Call as CallOrigin } from '../../models/Call';
import { CallUiPermissions } from './CallUiPermissions';
import { Fap } from './Fap';
import { InstrumentWithAvailabilityTime } from './Instrument';
import { Tag } from './Tag';
import { Template } from './Template';
import { Workflow } from './Workflow';

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

  @Field(() => Date, { nullable: true })
  public endCallInternal: Date;

  @Field(() => Date)
  public startReview: Date;

  @Field(() => Date)
  public endReview: Date;

  @Field(() => Date, { nullable: true })
  public startFapReview: Date;

  @Field(() => Date, { nullable: true })
  public endFapReview: Date;

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

  @Field({ nullable: true })
  public submissionMessage: string;

  @Field(() => Int, { nullable: true })
  public proposalWorkflowId: number;

  @Field(() => AllocationTimeUnits)
  public allocationTimeUnit: AllocationTimeUnits;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Int, { nullable: true })
  public esiTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public proposalPdfTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public experimentSafetyPdfTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public fapReviewTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public technicalReviewTemplateId?: number;

  @Field({ nullable: true })
  public title: string;

  @Field({ nullable: true })
  public description: string;

  @Field(() => Boolean)
  public isActive: boolean;

  @Field(() => Int)
  public sort_order: number;

  @Field(() => Int, { nullable: true })
  public experimentWorkflowId?: number;
}

@Resolver(() => Call)
export class CallInstrumentsResolver {
  @FieldResolver(() => [InstrumentWithAvailabilityTime])
  async instruments(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.instrument.dataSource.getInstrumentsByCallId([
      call.id,
    ]);
  }

  @FieldResolver(() => [Fap], { nullable: true })
  async faps(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.fap.dataSource.getFapsByCallId(call.id);
  }

  @FieldResolver(() => Workflow, { nullable: true })
  async proposalWorkflow(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.workflow.dataSource.getWorkflow(
      call.proposalWorkflowId
    );
  }

  @FieldResolver(() => Workflow, { nullable: true })
  async experimentWorkflow(
    @Root() call: Call,
    @Ctx() context: ResolverContext
  ) {
    if (!call.experimentWorkflowId) {
      return null;
    }

    return context.queries.workflow.dataSource.getWorkflow(
      call.experimentWorkflowId
    );
  }

  @FieldResolver(() => Template)
  async template(@Root() call: Call) {
    const templateDataSource = container.resolve(TemplateDataSource);

    return templateDataSource.getTemplate(call.templateId);
  }

  @FieldResolver(() => Int)
  async proposalCount(@Root() call: Call, @Ctx() context: ResolverContext) {
    return context.queries.proposal.dataSource.getCount(call.id);
  }

  @FieldResolver(() => Boolean)
  isActiveInternal(@Root() call: Call): boolean {
    const now = new Date();
    const startCall = new Date(call.startCall);
    const endCallInternal = new Date(call.endCallInternal);

    return startCall <= now && endCallInternal >= now;
  }

  @FieldResolver(() => [Tag], { nullable: true })
  async tags(
    @Root() call: Call,
    @Ctx() context: ResolverContext
  ): Promise<Tag[]> {
    const tags = await context.queries.tag.dataSource.getTagsForCalls([
      call.id,
    ]);

    return tags.get(call.id) ?? [];
  }

  @FieldResolver(() => CallUiPermissions)
  async callUiPermissions(
    @Root() call: Call,
    @Ctx() ctx: ResolverContext
  ): Promise<CallUiPermissions> {
    /*
     * Workaround for a limitation in buildContext.ts DI setup.
     * It doesn't allow injecting the user context at loader creation.
     * This workaround passes the user into the loader, but checks if the
     * loader already exists on the context to avoid creating multiple
     * loaders per request, which would make the DataLoader pointless.
     */
    if (!(ctx as any)._callPermissionsLoader) {
      (ctx as any)._callPermissionsLoader =
        ctx.loaders.callPermissions.createLoader(ctx.user);
    }

    return await (ctx as any)._callPermissionsLoader.load(call.id);
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
