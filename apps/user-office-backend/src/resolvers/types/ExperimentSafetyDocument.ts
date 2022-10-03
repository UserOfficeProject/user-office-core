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
import { EsdEvaluation } from '../../models/EsdEvaluation';
import { ExperimentSafetyDocument as ExperimentSafetyDocumentOrigin } from '../../models/ExperimentSafetyDocument';
import { BasicUserDetails } from './BasicUserDetails';
import { ExperimentSafetyInput } from './ExperimentSafetyInput';

@ObjectType()
export class ExperimentSafetyDocument
  implements Partial<ExperimentSafetyDocumentOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public esiId: number;

  @Field(() => Int)
  public reviewerUserId: number;

  @Field(() => EsdEvaluation)
  public evaluation: EsdEvaluation;

  @Field(() => String)
  public comment: string;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public evaluatedAt: Date;
}

@Resolver(() => ExperimentSafetyDocument)
export class ExperimentSafetyDocumentResolver {
  @FieldResolver(() => ExperimentSafetyInput)
  async esi(
    @Root() esd: ExperimentSafetyDocument,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentSafetyInput> {
    const esi = await context.queries.proposalEsi.getEsi(
      context.user,
      esd.esiId
    );
    if (!esi) {
      throw new Error('ESI must be defined');
    }

    return esi;
  }

  @FieldResolver(() => BasicUserDetails)
  async reviewer(
    @Root() esd: ExperimentSafetyDocument,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails> {
    const reviewer = await context.queries.user.getBasic(
      context.user,
      esd.reviewerUserId
    );
    if (!reviewer) {
      throw new Error('Reviewer must be defined');
    }

    return reviewer;
  }
}
