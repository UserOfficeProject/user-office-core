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

  /**
   * The workflow connection whose status actions (emails, RabbitMQ messages,
   * PDF generation) should run after the status change. Omit to change the
   * experiment safety status WITHOUT running any status actions.
   */
  @Field(() => Int, { nullable: true })
  public statusActionsWorkflowConnectionId?: number;
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
