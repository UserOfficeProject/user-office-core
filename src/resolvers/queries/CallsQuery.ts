import { Ctx, Query, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { Call } from "../types/Call";

@Resolver()
export class CallsQuery {
  @Query(() => [Call], { nullable: true })
  calls(@Ctx() context: ResolverContext) {
    return context.queries.call.getAll(context.user);
  }
}
