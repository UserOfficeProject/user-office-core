import { Resolver, ObjectType, Arg, Ctx, Mutation, Field } from "type-graphql";
import { ResolverContext } from "../context";
import { createResponseWrapper, MutationResultBase } from "./Utils";

const wrapTokenMutation = createResponseWrapper<String>("token");

@ObjectType()
class TokenMutationResult extends MutationResultBase {
  @Field()
  public token: String;
}
@Resolver()
export class TokenQuery {
  @Mutation(() => TokenMutationResult, { nullable: true })
  token(@Arg("token") token: string, @Ctx() context: ResolverContext) {
    return wrapTokenMutation(context.mutations.user.token(token));
  }
}
