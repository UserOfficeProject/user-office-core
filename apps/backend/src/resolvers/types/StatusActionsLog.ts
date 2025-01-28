import {
  Ctx,
  Directive,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { StatusActionsLog as StatusActionsLogOrigin } from '../../models/StatusActionsLog';
import { ConnectionStatusAction } from './ConnectionStatusAction';
import { Proposal } from './Proposal';
import { EmailStatusActionRecipients } from './ProposalStatusActionConfig';

@ObjectType()
@Directive('@key(fields: "statusActionsLogId")')
export class StatusActionsLog implements Partial<StatusActionsLogOrigin> {
  @Field(() => Int)
  public statusActionsLogId: number;

  @Field(() => EmailStatusActionRecipients)
  public emailStatusActionRecipient: EmailStatusActionRecipients;

  @Field(() => Boolean)
  public statusActionsSuccessful: boolean;

  @Field(() => String)
  public statusActionsMessage: string;

  @Field(() => Date)
  public statusActionsTstamp: Date;
}
@Resolver(() => StatusActionsLog)
export class StatusActionsLogResolver {
  @FieldResolver(() => ConnectionStatusAction, { nullable: true })
  async connectionStatusAction(
    @Root() statusActionsLog: StatusActionsLogOrigin,
    @Ctx() context: ResolverContext
  ) {
    if (!statusActionsLog.actionId || !statusActionsLog.connectionId) {
      return null;
    }

    return context.queries.statusAction.dataSource.getConnectionStatusAction(
      statusActionsLog.connectionId,
      statusActionsLog.actionId
    );
  }

  @FieldResolver(() => [Proposal])
  async proposals(
    @Root() statusActionsLog: StatusActionsLogOrigin,
    @Ctx() context: ResolverContext
  ): Promise<Proposal[] | null> {
    if (!statusActionsLog.statusActionsLogId) {
      return null;
    }
    const statusActionsProposals =
      await context.queries.statusActionsLogs.dataSource.getStatusActionsLogHasProposals(
        statusActionsLog.statusActionsLogId
      );
    if (!statusActionsProposals || statusActionsProposals.length < 1) {
      return null;
    }

    return context.queries.proposal.dataSource.getProposalsByPks(
      statusActionsProposals.map((proposal) => proposal.proposalPk)
    );
  }
}
