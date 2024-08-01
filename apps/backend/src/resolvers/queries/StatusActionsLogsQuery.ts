import {
  Query,
  Ctx,
  Resolver,
  InputType,
  Arg,
  Field,
  Int,
  ArgsType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { EmailStatusActionRecipients } from '../types/ProposalStatusActionConfig';
import { StatusActionsLog } from '../types/StatusActionsLog';

@InputType()
export class StatusActionsLogsFilter {
  @Field(() => [Int], { nullable: true })
  public statusActionsLogIds?: number[];

  @Field(() => String, { nullable: true })
  public statusActionsMessage?: string;

  @Field(() => Boolean, { nullable: true })
  public statusActionsSuccessful?: boolean;

  @Field(() => [Int], { nullable: true })
  public statusActionIds?: number[];

  @Field(() => [Int], { nullable: true })
  public connectionIds?: number[];

  @Field(() => [EmailStatusActionRecipients], { nullable: true })
  public statusActionsSteps?: EmailStatusActionRecipients[];
}
@ArgsType()
export class StatusActionsLogsArgs {
  @Field(() => Int, { nullable: true })
  public parentStatusActionsLogId: number | null;

  @Field(() => Int)
  public connectionId: number;

  @Field(() => Int)
  public actionId: number;

  @Field(() => EmailStatusActionRecipients)
  public statusActionsStep: EmailStatusActionRecipients;

  @Field(() => Int, { nullable: true })
  public statusActionsBy?: number | null;

  @Field(() => Boolean, { nullable: true })
  public statusActionsSuccessful: boolean;

  @Field(() => String, { nullable: true })
  public statusActionsMessage: string;

  @Field(() => [Int], { nullable: true })
  public proposalPks: number[];
}

@Resolver()
export class StatusActionsLogsQuery {
  @Query(() => [StatusActionsLog], { nullable: true })
  statusActionsLogs(
    @Arg('filter', () => StatusActionsLogsFilter, { nullable: true })
    filter: StatusActionsLogsFilter | undefined,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.statusActionsLogs.getStatusActionsLogs(
      context.user,
      filter
    );
  }
}
