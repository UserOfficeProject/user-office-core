import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver
} from "type-graphql";
import { ResolverContext } from "../../context";
import { ProposalTemplateResponseWrap, wrapTemplate } from "../Wrappers";

@ArgsType()
class UpdateProposalTemplateFieldArgs {
  @Field()
  public id: string;

  @Field({ nullable: true })
  public question: string;

  @Field({ nullable: true })
  public config: string;

  @Field({ nullable: true })
  public isEnabled: boolean;

  @Field(() => FieldDependencyInput, { nullable: true })
  public dependencies: FieldDependencyInput[];
}

@InputType()
class FieldDependencyInput {
  @Field(type => String, { nullable: true })
  public proposal_question_dependency: string;
  @Field(type => String, { nullable: true })
  public proposal_question_id: string;
  @Field(type => String, { nullable: true })
  public condition: string;
}

@Resolver()
export class UpdateProposalTemplateFieldMutation {
  @Mutation(() => ProposalTemplateResponseWrap, { nullable: true })
  UpdateProposalTemplateField(
    @Args() args: UpdateProposalTemplateFieldArgs,
    @Ctx() context: ResolverContext
  ) {
    wrapTemplate(
      context.mutations.template.updateProposalTemplateField(
        context.user,
        args.id,
        undefined,
        undefined,
        args.question,
        undefined,
        args.config,
        args.dependencies
      )
    );
  }
}
