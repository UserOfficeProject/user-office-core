import {
  Query,
  Ctx,
  Resolver,
  InputType,
  Field,
  Int,
  ArgsType,
  Args,
  ObjectType,
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
  public emailStatusActionRecipient?: EmailStatusActionRecipients[];
}
@ArgsType()
export class StatusActionsLogsArgs {
  @Field(() => Int, { nullable: true })
  public statusActionsLogId: number | null;

  @Field(() => Int)
  public connectionId: number;

  @Field(() => Int)
  public actionId: number;

  @Field(() => EmailStatusActionRecipients)
  public emailStatusActionRecipient: EmailStatusActionRecipients;

  @Field(() => Int, { nullable: true })
  public statusActionsBy?: number | null;

  @Field(() => Boolean, { nullable: true })
  public statusActionsSuccessful: boolean;

  @Field(() => String, { nullable: true })
  public statusActionsMessage: string;

  @Field(() => [Int], { nullable: true })
  public proposalPks: number[];
}

@ObjectType()
class StatusActionsLogQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [StatusActionsLog])
  public statusActionsLogs: StatusActionsLog[];
}
@ArgsType()
export class StatusActionsLogsFilterArgs {
  @Field(() => StatusActionsLogsFilter, { nullable: true })
  public filter?: StatusActionsLogsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;

  @Field({ nullable: true })
  public sortField?: string;

  @Field({ nullable: true })
  public sortDirection?: string;

  @Field({ nullable: true })
  public searchText?: string;
}
@Resolver()
export class StatusActionsLogsQuery {
  @Query(() => StatusActionsLogQueryResult, { nullable: true })
  statusActionsLogs(
    @Args() args: StatusActionsLogsFilterArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.statusActionsLogs.getStatusActionsLogs(
      context.user,
      args
    );
  }
}
