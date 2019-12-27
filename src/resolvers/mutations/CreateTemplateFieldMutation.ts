import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Args,
  Int,
  ArgsType
} from "type-graphql";
import { ResolverContext } from "../../context";
import { AbstractResponseWrap, wrapResponse } from "../Utils";
import { ProposalTemplateField, DataType } from "../../models/ProposalModel";

@ObjectType()
class CreateTemplateFieldResponseWrap extends AbstractResponseWrap<
  ProposalTemplateField
> {
  @Field({ nullable: true })
  public field: ProposalTemplateField;

  setValue(value: ProposalTemplateField): void {
    this.field = value;
  }
}

const wrap = wrapResponse<ProposalTemplateField>(
  new CreateTemplateFieldResponseWrap()
);

@ArgsType()
class CreateTemplateFieldArgs {
  @Field(() => Int)
  topicId: number;

  @Field(() => DataType)
  dataType: DataType;
}

@Resolver()
export class CreateTemplateFieldMutation {
  @Mutation(() => CreateTemplateFieldResponseWrap, { nullable: true })
  createTemplateField(
    @Args() args: CreateTemplateFieldArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.template.createTemplateField(
        context.user,
        args.topicId,
        args.dataType
      )
    );
  }
}
