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
import { Questionary } from './Questionary';

@ObjectType()
export class Visit implements Partial<VisitOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => VisitStatus)
  public status: VisitStatus;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public visitorId: number;
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

  @FieldResolver(() => [BasicUserDetails])
  async team(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[] | null> {
    return context.queries.visit.getTeam(context.user, visit.id);
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    return context.queries.questionary.getQuestionary(
      context.user,
      visit.questionaryId
    );
  }
}
