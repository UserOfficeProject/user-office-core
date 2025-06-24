import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from '../types/Visit';

@ArgsType()
export class UpdateVisitArgs {
  @Field(() => Int)
  visitId: number;

  @Field(() => [Int], { nullable: true })
  team?: number[];

  @Field(() => Int, { nullable: true })
  teamLeadUserId?: number;

  @Field(() => [String!], { nullable: true })
  inviteEmails?: string[];
}

@Resolver()
export class UpdateVisitMutation {
  @Mutation(() => Visit)
  async updateVisit(
    @Args() args: UpdateVisitArgs,
    @Ctx() context: ResolverContext
  ) {
    const result = await context.mutations.visit.updateVisit(
      context.user,
      args
    );

    await context.mutations.invite.setVisitRegistrationInvites(context.user, {
      visitId: args.visitId,
      emails: args.inviteEmails ?? [],
    });

    return result;
  }
}
