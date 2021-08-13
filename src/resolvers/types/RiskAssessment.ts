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
import {
  RiskAssessment as RiskAssessmentOrig,
  RiskAssessmentStatus,
} from '../../models/RiskAssessment';
import { TemplateCategoryId } from '../../models/Template';
import { Questionary } from './Questionary';

@ObjectType()
export class RiskAssessment implements Partial<RiskAssessmentOrig> {
  @Field(() => Int)
  public riskAssessmentId: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public creatorUserId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => RiskAssessmentStatus)
  public status: RiskAssessmentStatus;
}

@Resolver(() => RiskAssessment)
export class RiskAssessmentResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() riskAssessment: RiskAssessment,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      riskAssessment.questionaryId,
      TemplateCategoryId.PROPOSAL_QUESTIONARY
    );
  }
}
