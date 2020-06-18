import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { FieldDependency as FieldDependencyOrigin } from '../../models/ProposalModel';
import { TemplateResponseWrap } from '../types/CommonWrappers';
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
  public dependencyId: string;

  @Field(() => FieldConditionInput)
  public condition: FieldConditionInput;
}

@ArgsType()
export class UpdateQuestionTopicRelationArgs {
  @Field()
  public questionId: string;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Int, { nullable: true })
  public topicId?: number;

  @Field(() => Int, { nullable: true })
  public sortOrder?: number;

  @Field({ nullable: true })
  public config?: string;

  @Field(() => FieldDependencyInput, { nullable: true })
  public dependency?: FieldDependencyInput;
}

@Resolver()
export class UpdateQuestionTopicRelationMutation {
  @Mutation(() => TemplateResponseWrap)
  updateQuestionTopicRelation(
    @Args() args: UpdateQuestionTopicRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    args.dependency = this.unpackDependency(args.dependency);

    return wrapResponse(
      context.mutations.template.updateQuestionTopicRelation(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  unpackDependency(dependency?: FieldDependencyInput) {
    if (!dependency) {
      return undefined;
    }

    return {
      ...dependency,
      condition: {
        ...dependency.condition,
        params: JSON.parse(dependency.condition.params).value,
      },
    };
  }
}
