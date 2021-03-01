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
import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '../../models/ConditionEvaluator';
import { FieldDependency as FieldDependencyOrigin } from '../../models/Template';
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
export class UpdateQuestionTemplateRelationSettingsArgs {
  @Field()
  public questionId: string;

  @Field(() => Int)
  public templateId: number;

  @Field({ nullable: true })
  public config?: string;

  @Field(() => [FieldDependencyInput])
  public dependencies: FieldDependencyInput[];

  @Field(() => DependenciesLogicOperator, { nullable: true })
  public dependenciesOperator?: DependenciesLogicOperator;
}

@Resolver()
export class UpdateQuestionTemplateRelationSettingsMutation {
  @Mutation(() => TemplateResponseWrap)
  updateQuestionTemplateRelationSettings(
    @Args() args: UpdateQuestionTemplateRelationSettingsArgs,
    @Ctx() context: ResolverContext
  ) {
    args.dependencies = this.unpackDependencies(args.dependencies);

    return wrapResponse(
      context.mutations.template.updateQuestionTemplateRelationSettings(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  unpackDependencies(dependencies: FieldDependencyInput[]) {
    if (!dependencies?.length) {
      return dependencies;
    }

    return dependencies.map((dependency) => ({
      ...dependency,
      condition: {
        ...dependency.condition,
        params: JSON.parse(dependency.condition.params).value,
      },
    }));
  }
}
