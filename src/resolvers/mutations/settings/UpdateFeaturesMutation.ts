import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { FeatureId, FeatureUpdateAction } from '../../../models/Feature';
import { FeaturesResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class UpdateFeaturesInput {
  @Field(() => [FeatureId])
  public featureIds: [FeatureId];

  @Field(() => FeatureUpdateAction)
  public action: FeatureUpdateAction;
}

@Resolver()
export class UpdateProposalStatusMutation {
  @Mutation(() => FeaturesResponseWrap)
  async updateFeatures(
    @Ctx() context: ResolverContext,
    @Arg('updatedFeaturesInput')
    updatedFeaturesInput: UpdateFeaturesInput
  ) {
    return wrapResponse(
      context.mutations.admin.updateFeatures(
        context.user,
        updatedFeaturesInput
      ),
      FeaturesResponseWrap
    );
  }
}
