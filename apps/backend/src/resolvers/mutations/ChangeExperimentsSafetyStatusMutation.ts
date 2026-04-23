import {
  Ctx,
  Mutation,
  Resolver,
  Arg,
  Int,
  Field,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';

@InputType()
export class ChangeExperimentsSafetyStatusInput {
  @Field(() => Int)
  public workflowStatusId: number;

  @Field(() => [Int])
  public experimentSafetyPks: number[];
}

@Resolver()
export class ChangeExperimentsSafetyStatusMutation {
  @Mutation(() => Boolean)
  async changeExperimentsSafetyStatus(
    @Arg('changeExperimentsSafetyStatusInput')
    changeExperimentsSafetyStatusInput: ChangeExperimentsSafetyStatusInput,
    @Ctx() context: ResolverContext
  ) {
    const result =
      await context.mutations.experiment.changeExperimentsSafetyStatus(
        context.user,
        changeExperimentsSafetyStatusInput
      );

    return isRejection(result) ? result : true;
  }
}
