import { Proposal } from "./../../models/Proposal";
import {
  Query,
  Ctx,
  Resolver,
  ArgsType,
  Field,
  Int,
  Args,
  ObjectType
} from "type-graphql";
import { ResolverContext } from "../../context";

@ArgsType()
class ProposalsArgs {
  @Field(() => String, { nullable: true })
  public filter: string;

  @Field(() => Int, { nullable: true })
  public first: number;

  @Field(() => Int, { nullable: true })
  public offset: number;
}

@ObjectType()
class ProposalsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Proposal])
  public proposals: Proposal[];
}

@Resolver()
export class ProposalsQuery {
  @Query(() => ProposalsQueryResult, { nullable: true })
  async proposals(
    @Args() args: ProposalsArgs,
    @Ctx() context: ResolverContext
  ): Promise<ProposalsQueryResult | null> {
    return context.queries.proposal.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  }
}
