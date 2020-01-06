import { Query, Arg, Ctx, Resolver, Int } from "type-graphql";
import { ResolverContext } from "../../context";
import { BasicUserDetails } from "../types/BasicUserDetails";

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
