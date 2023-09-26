import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { GenericTemplate as GenericTemplateOrigin } from '../../models/GenericTemplate';
import { TemplateCategoryId } from '../../models/Template';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';

@ObjectType()
export class GenericTemplate implements Partial<GenericTemplateOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field()
  public questionId: string;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => GenericTemplate)
export class GenericTemplateResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() GenericTemplate: GenericTemplate,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      GenericTemplate.questionaryId,
      TemplateCategoryId.GENERIC_TEMPLATE
    );
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() GenericTemplate: GenericTemplate,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(
      context.user,
      GenericTemplate.proposalPk
    );
  }
}
