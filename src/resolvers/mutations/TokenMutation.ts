import { Resolver, ObjectType, Arg, Ctx, Mutation, Field } from "type-graphql";
import { ResolverContext } from "../../context";
import { wrapResponse, AbstractResponseWrap } from "../Utils";

@ObjectType()
class TokenResponseWrap extends AbstractResponseWrap<string> {
  @Field()
  public token: String;

  setValue(value: string): void {
    this.token = value;
  }
}

const wrapTokenMutation = wrapResponse<String>(new TokenResponseWrap());

@Resolver()
export class TokenMutation {
  @Mutation(() => TokenResponseWrap)
  token(@Arg("token") token: string, @Ctx() context: ResolverContext) {
    return wrapTokenMutation(context.mutations.user.token(token));
  }
}
