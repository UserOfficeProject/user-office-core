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
import { Visitation as VisitationOrigin } from '../../models/Visitation';
import { VisitationStatus } from './../../models/Visitation';
import { BasicUserDetails } from './BasicUserDetails';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';

@ObjectType()
export class Visitation implements Partial<VisitationOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public proposalId: number;

  @Field(() => VisitationStatus)
  public status: VisitationStatus;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public visitorId: number;
}

@Resolver(() => Visitation)
export class VisitationResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() visitation: Visitation,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, visitation.proposalId);
  }

  @FieldResolver(() => [BasicUserDetails])
  async team(
    @Root() visitation: Visitation,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[] | null> {
    return context.queries.visitation.getTeam(context.user, visitation.id);
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() visitation: Visitation,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    return context.queries.questionary.getQuestionary(
      context.user,
      visitation.questionaryId
    );
  }
}
