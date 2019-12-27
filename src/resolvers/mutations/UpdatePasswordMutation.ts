import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  ArgsType,
  Int,
  Args
} from "type-graphql";
import { ResolverContext } from "../../context";
import { wrapResponse, AbstractResponseWrap } from "../Utils";
import { BasicUserDetails } from "../../models/User";

@ObjectType()
class UpdatePasswordResponseWrap extends AbstractResponseWrap<
  BasicUserDetails
> {
  @Field({ nullable: true })
  public user: BasicUserDetails;
  setValue(value: BasicUserDetails): void {
    this.user = value;
  }
}

const wrap = wrapResponse<BasicUserDetails>(new UpdatePasswordResponseWrap());

@ArgsType()
class UpdatePasswordArguments {
  @Field(() => Int)
  public id: number;

  @Field()
  public password: string;
}
@Resolver()
export class UpdatePasswordMutations {
  @Mutation(() => UpdatePasswordResponseWrap)
  updatePassword(
    @Args() { id, password }: UpdatePasswordArguments,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.user.updatePassword(context.user, id, password)
    );
  }
}
