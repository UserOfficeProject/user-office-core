import { Ctx, Query, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { Call } from "../../models/Call";
@Resolver()
export class CallsQuery {
  @Query(() => [Call], { nullable: true })
  calls(@Ctx() context: ResolverContext) {
    return context.queries.call.getAll(context.user);
  }
}
