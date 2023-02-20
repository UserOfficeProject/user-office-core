import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { FeatureId, FeatureUpdateAction } from '../../../models/Feature';
import { Feature } from '../../types/Feature';

@InputType()
export class UpdateFeaturesInput {
  @Field(() => [FeatureId])
  public featureIds: FeatureId[];

  @Field(() => FeatureUpdateAction)
  public action: FeatureUpdateAction;
}

@Resolver()
export class UpdateFeaturesMutation {
  @Mutation(() => [Feature])
  async updateFeatures(
    @Ctx() context: ResolverContext,
    @Arg('updatedFeaturesInput')
    updatedFeaturesInput: UpdateFeaturesInput
  ) {
    return context.mutations.admin.updateFeatures(
      context.user,
      updatedFeaturesInput
    );
  }
}
