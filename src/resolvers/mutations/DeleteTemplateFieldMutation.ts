import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalTemplate } from "../../models/ProposalModel";
import { AbstractResponseWrap, wrapResponse } from "../Utils";
@ObjectType()
class DeleteTemplateFieldResponseWrap extends AbstractResponseWrap<
  ProposalTemplate
> {
  @Field(() => ProposalTemplate, { nullable: true })
  public template: ProposalTemplate;

  setValue(value: ProposalTemplate): void {
    this.template = value;
  }
}

const wrap = wrapResponse<ProposalTemplate>(
  new DeleteTemplateFieldResponseWrap()
);

@Resolver()
export class DeleteTemplateFieldMutation {
  @Mutation(() => DeleteTemplateFieldResponseWrap, { nullable: true })
  deleteTemplateField(
    @Arg("id", () => String) id: string,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.template.deleteTemplateField(context.user, id)
    );
  }
}
