import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { DataType } from "../../models/ProposalModel";
import { TemplateFieldResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";

@ArgsType()
export class CreateTemplateFieldArgs {
  @Field(() => Int)
  topicId: number;

  @Field(() => DataType)
  dataType: DataType;
}

@Resolver()
export class CreateTemplateFieldMutation {
  @Mutation(() => TemplateFieldResponseWrap)
  createTemplateField(
    @Args() args: CreateTemplateFieldArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.createTemplateField(context.user, args),
      TemplateFieldResponseWrap
    );
  }
}
