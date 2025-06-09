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
import { isRejection, rejection } from '../../models/Rejection';
import { Visit } from '../types/Visit';

@ArgsType()
export class CreateVisitArgs {
  @Field(() => Int!)
  experimentPk: number;

  @Field(() => [Int!])
  team: number[];

  @Field(() => Int)
  teamLeadUserId: number;

  @Field(() => [String!], { nullable: true })
  inviteEmails?: string[];
}

@Resolver()
export class CreateVisitMutation {
  @Mutation(() => Visit)
  async createVisit(
    @Args() args: CreateVisitArgs,
    @Ctx() context: ResolverContext
  ) {
    const visit = await context.mutations.visit.createVisit(context.user, args);
    if (isRejection(visit)) {
      return rejection('CREATE_VISIT_FAILED');
    }

    await context.mutations.invite.setVisitRegistrationInvites(context.user, {
      visitId: visit.id,
      inviteEmails: args.inviteEmails ?? [],
    });

    return visit;
  }
}
