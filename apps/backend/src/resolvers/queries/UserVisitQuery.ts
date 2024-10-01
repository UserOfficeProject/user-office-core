import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitRegistration } from '../types/VisitRegistration';

@InputType()
export class GetVisitRegistrationsFilter {
  @Field(() => [Int], { nullable: true })
  public registrationQuestionaryIds?: number[];

  @Field(() => Int, { nullable: true })
  public visitId?: number;
}

@ArgsType()
export class VisitRegistrationsArgs {
  @Field(() => GetVisitRegistrationsFilter, { nullable: true })
  public filter?: GetVisitRegistrationsFilter;
}

@Resolver()
export class VisitRegistrationQuery {
  @Query(() => VisitRegistration, { nullable: true })
  visitRegistration(
    @Ctx() context: ResolverContext,
    @Arg('visitId', () => Int) visitId: number
  ) {
    return context.queries.visit.getRegistration(context.user, visitId);
  }

  @Query(() => [VisitRegistration], { nullable: true })
  visitRegistrations(
    @Ctx() context: ResolverContext,
    @Args() args: VisitRegistrationsArgs
  ) {
    return context.queries.visit.getRegistrations(context.user, args);
  }
}
