import {
  Resolver,
  ObjectType,
  Arg,
  Ctx,
  Mutation,
  Field,
  ArgsType,
  Int,
  Args
} from "type-graphql";
import { ResolverContext } from "../../context";
import { createResponseWrapper, MutationResultBase } from "../Utils";
import { BasicUserDetails } from "../../models/User";

@ObjectType()
class UpdatePasswordMutationResult extends MutationResultBase {
  @Field({ nullable: true })
  public user: BasicUserDetails;
}

const resultWrapper = createResponseWrapper<BasicUserDetails>("user");

@ArgsType()
class UpdatePasswordArguments {
  @Field(() => Int)
  public id: number;

  @Field()
  public password: string;
}
@Resolver()
export class UpdatePasswordMutations {
  @Mutation(() => UpdatePasswordMutationResult, { nullable: true })
  updatePassword(
    @Args() { id, password }: UpdatePasswordArguments,
    @Ctx() context: ResolverContext
  ) {
    return resultWrapper(
      context.mutations.user.updatePassword(context.user, id, password)
    );
  }
}
