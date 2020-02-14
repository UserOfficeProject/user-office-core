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
import {
  FieldDependency as FieldDependencyOrigin,
  FieldDependency
} from "../../models/ProposalModel";
import { EvaluatorOperator } from "../../models/ConditionEvaluator";

@ArgsType()
export class UpdateProposalTemplateFieldArgs {
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

  @Field(() => String)
  public params: any;
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
    args.dependencies = this.unpackDependencies(args.dependencies);
    return wrapResponse(
      context.mutations.template.updateProposalTemplateField(
        context.user,
        args
      ),
      ProposalTemplateResponseWrap
    );
  }

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  unpackDependencies(dependencies: FieldDependency[]) {
    return dependencies.map(dependency => {
      return {
        ...dependency,
        condition: {
          ...dependency.condition,
          params: JSON.parse(dependency.condition.params).value
        }
      };
    });
  }
}
