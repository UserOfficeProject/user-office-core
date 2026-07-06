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
export class ChangeProposalsStatusInput {
  @Field(() => Int)
  public workflowStatusId: number;

  @Field(() => [Int])
  public proposalPks: number[];

  /**
   * The workflow connection whose status actions (emails, RabbitMQ messages,
   * PDF generation) should run after the status change. Omit to change the
   * proposal status WITHOUT running any status actions.
   */
  @Field(() => Int, { nullable: true })
  public statusActionsWorkflowConnectionId?: number;
}

@Resolver()
export class ChangeProposalsStatusMutation {
  @Mutation(() => Boolean)
  async changeProposalsStatus(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    const result = await context.mutations.proposal.changeProposalsStatus(
      context.user,
      changeProposalsStatusInput
    );

    return isRejection(result) ? result : true;
  }
}
