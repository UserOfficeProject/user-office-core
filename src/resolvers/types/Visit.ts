import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit as VisitOrigin } from '../../models/Visit';
import { VisitStatus } from '../../models/Visit';
import { BasicUserDetails } from './BasicUserDetails';
import { Proposal } from './Proposal';
import { Sample } from './Sample';
import { VisitRegistration } from './VisitRegistration';

@ObjectType()
export class Visit implements Partial<VisitOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => VisitStatus)
  public status: VisitStatus;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public teamLeadUserId: number;

  @Field(() => Int)
  public scheduledEventId: number;
}

@Resolver(() => Visit)
export class VisitResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, visit.proposalPk);
  }

  @FieldResolver(() => [VisitRegistration])
  async registrations(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<VisitRegistration[] | null> {
    return context.queries.visit.getRegistrations(context.user, {
      visitId: visit.id,
    });
  }

  @FieldResolver(() => BasicUserDetails)
  async teamLead(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, visit.teamLeadUserId);
  }

  @FieldResolver(() => [Sample])
  async samples(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<Sample[]> {
    return context.queries.sample.getSamples(context.user, {
      filter: { visitId: visit.id },
    });
  }
}
