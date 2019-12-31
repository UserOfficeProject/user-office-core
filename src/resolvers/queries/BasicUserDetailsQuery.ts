import { Query, Arg, Ctx, Resolver, Int } from "type-graphql";
import { BasicUserDetails } from "../../models/User";
import { ResolverContext } from "../../context";

@Resolver()
export class BasicUserDetailsQuery {
  @Query(() => BasicUserDetails, { nullable: true })
  basicUserDetails(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getBasic(context.user, id);
  }
}
