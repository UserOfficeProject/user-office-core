import {
  Resolver,
  Ctx,
  Mutation,
  Field,
  Int,
  ArgsType,
  Args,
  ObjectType
} from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ArgsType()
class UpdateFieldTopicRelArgs {
  @Field(() => Int)
  public topic_id: number;

  @Field(() => [String], { nullable: true })
  public field_ids: string[];
}

@ObjectType()
class UpdateFieldTopicRelResponseWrap extends AbstractResponseWrap<string[]> {
  @Field(() => [String], { nullable: true })
  public result: string[];

  setValue(value: string[]): void {
    this.result = value;
  }
}

const wrap = wrapResponse<string[]>(new UpdateFieldTopicRelResponseWrap());

@Resolver()
export class UpdateFieldTopicRelMutation {
  @Mutation(() => AbstractResponseWrap)
  updateFieldTopicRel(
    @Args() args: UpdateFieldTopicRelArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.template.updateFieldTopicRel(
        context.user,
        args.topic_id,
        args.field_ids
      )
    );
  }
}
