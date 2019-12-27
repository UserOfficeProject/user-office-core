import { Query, Arg, Ctx, Resolver } from "type-graphql";
import { User } from "../../models/User";
import { ResolverContext } from "../../context";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  user(@Arg("id") id: number, @Ctx() context: ResolverContext) {
    return context.queries.user.get(context.user, id);
  }
}
