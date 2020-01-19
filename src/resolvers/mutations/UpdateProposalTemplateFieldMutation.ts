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
import { ProposalTemplateResponseWrap } from "../types/CommonWrappers";
import { wrapResponse } from "../wrapResponse";
import { FieldCondition } from "../types/FieldCondition";
import { FieldDependency as FieldDependencyOrigin } from "../../models/ProposalModel";
import { EvaluatorOperator } from "../../models/ConditionEvaluator";

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
class FieldConditionInput implements Partial<FieldCondition> {
  @Field(() => EvaluatorOperator)
  public condition: EvaluatorOperator;

  @Field()
  public params: string;
}

@InputType()
class FieldDependencyInput implements Partial<FieldDependencyOrigin> {
  @Field(() => String)
  public proposal_question_dependency: string;

  @Field(() => String)
  public proposal_question_id: string;

  @Field(() => FieldConditionInput)
  public condition: FieldConditionInput;
}

@Resolver()
export class UpdateProposalTemplateFieldMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  updateProposalTemplateField(
    @Args() args: UpdateProposalTemplateFieldArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateProposalTemplateField(
        context.user,
        args.id,
        undefined,
        undefined,
        args.question,
        undefined,
        args.config,
        args.dependencies
      ),
      ProposalTemplateResponseWrap
    );
  }
}
