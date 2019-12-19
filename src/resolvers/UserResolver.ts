
import "reflect-metadata";
import { Resolver, Query, Arg, Ctx } from "type-graphql";
import { BasicUserDetails } from "../models/User";
import { ResolverContext } from "../context";
import { User } from "../../build/src/models/User";


@Resolver()
export class UserResolver {

  @Query(() => BasicUserDetails, { nullable: true })
  basicUserDetails(@Arg("id") id: string, @Ctx() context: ResolverContext) {
    return context.queries.user.getBasic(context.user, parseInt(id));
  }


  /*
    @Mutation(returns => Boolean)
    @Authorized(Roles.Admin)
    async removeRecipe(@Arg("id") id: string) {
      try {
        await this.recipeService.removeById(id);
        return true;
      } catch {
        return false;
      }
    }
  */
}


