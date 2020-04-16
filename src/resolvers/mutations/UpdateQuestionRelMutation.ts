import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { FieldDependency as FieldDependencyOrigin } from '../../models/ProposalModel';
import { ProposalTemplateResponseWrap } from '../types/CommonWrappers';
import { FieldCondition } from '../types/FieldCondition';
import { wrapResponse } from '../wrapResponse';

@InputType()
class FieldConditionInput implements Partial<FieldCondition> {
  @Field(() => EvaluatorOperator)
  public condition: EvaluatorOperator;

  @Field(() => String)
  public params: any;
}

@InputType()
export class FieldDependencyInput implements Partial<FieldDependencyOrigin> {
  @Field(() => String)
  public dependency_id: string;

  @Field(() => String)
  public question_id: string;

  @Field(() => FieldConditionInput)
  public condition: FieldConditionInput;
}

@ArgsType()
export class UpdateQuestionRelArgs {
  @Field()
  public questionId: string;

  @Field(() => Int)
  public templateId: number;

  @Field({ nullable: true })
  public topicId?: number;

  @Field(() => Int, { nullable: true })
  public sortOrder: number;

  @Field(() => FieldDependencyInput)
  public dependencies: FieldDependencyInput[];
}

@Resolver()
export class UpdateQuestionRelMutation {
  @Mutation(() => ProposalTemplateResponseWrap)
  updateQuestionRel(
    @Args() args: UpdateQuestionRelArgs,
    @Ctx() context: ResolverContext
  ) {
    args.dependencies = this.unpackDependencies(args.dependencies);

    return wrapResponse(
      context.mutations.template.updateQuestionRel(context.user, args),
      ProposalTemplateResponseWrap
    );
  }

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  unpackDependencies(dependencies: FieldDependencyInput[]) {
    return dependencies.map(dependency => {
      return {
        ...dependency,
        condition: {
          ...dependency.condition,
          params: JSON.parse(dependency.condition.params).value,
        },
      };
    });
  }
}
