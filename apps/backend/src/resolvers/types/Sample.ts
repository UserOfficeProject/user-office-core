import { GraphQLError } from 'graphql';
import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { Proposal } from './Proposal';
import { Questionary } from './Questionary';
import { ResolverContext } from '../../context';
import { Sample as SampleOrigin, SampleStatus } from '../../models/Sample';

@ObjectType()
export class Sample implements Partial<SampleOrigin> {
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

  @Field()
  public isPostProposalSubmission: boolean;

  @Field(() => SampleStatus)
  public safetyStatus: SampleStatus;

  @Field()
  public safetyComment: string;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => Sample)
export class SampleResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() sample: Sample,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    const questionary = await context.queries.questionary.getQuestionary(
      context.user,
      sample.questionaryId
    );

    if (!questionary) {
      // This should never happen because questionary is created when sample is created
      throw new GraphQLError(
        `Questionary for sample ${sample.id} was not found`
      );
    }

    return questionary;
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() sample: Sample,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, sample.proposalPk);
  }
}
