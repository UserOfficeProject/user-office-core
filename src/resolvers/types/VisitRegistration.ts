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
import { TemplateCategoryId } from '../../models/Template';
import { VisitRegistration as VisitRegistrationOrig } from '../../models/VisitRegistration';
import { TrainingStatus } from './../../models/VisitRegistration';
import { BasicUserDetails } from './BasicUserDetails';
import { Questionary } from './Questionary';

@ObjectType()
export class VisitRegistration implements Partial<VisitRegistrationOrig> {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public visitId: number;

  @Field(() => Int, { nullable: true })
  public registrationQuestionaryId: number | null;

  @Field(() => Boolean)
  public isRegistrationSubmitted: boolean;

  @Field(() => Date, { nullable: true })
  public trainingExpiryDate: Date | null;

  @Field(() => Date, { nullable: true })
  public startsAt: Date | null;

  @Field(() => Date, { nullable: true })
  public endsAt: Date | null;
}

@Resolver((of) => VisitRegistration)
export class UserVisitResolver {
  @FieldResolver(() => BasicUserDetails)
  async user(
    @Root() userVisit: VisitRegistration,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, userVisit.userId);
  }

  @FieldResolver(() => Questionary)
  async questionary(
    @Root() userVisit: VisitRegistration,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      userVisit.registrationQuestionaryId || 0,
      TemplateCategoryId.VISIT_REGISTRATION
    );
  }

  @FieldResolver(() => TrainingStatus)
  async trainingStatus(
    @Root() userVisit: VisitRegistration,
    @Ctx() context: ResolverContext
  ): Promise<TrainingStatus> {
    return context.queries.visit.getTrainingStatus(userVisit);
  }
}
