import { Query, Arg, Ctx, Resolver } from "type-graphql";
import { BasicUserDetails } from "../models/User";
import { ResolverContext } from "../context";

@Resolver()
export class BasicUserDetailsQuery {
  @Query(() => BasicUserDetails, { nullable: true })
  basicUserDetails(@Arg("id") id: number, @Ctx() context: ResolverContext) {
    return context.queries.user.getBasic(context.user, id);
  }
}
