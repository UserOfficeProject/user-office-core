import { Resolver, ObjectType, Ctx, Mutation, Field } from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../../models/Proposal";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
class CreateProposalResponseWrap extends AbstractResponseWrap<Proposal> {
  @Field(() => Proposal, { nullable: true })
  public proposal: Proposal;

  setValue(value: Proposal): void {
    this.proposal = value;
  }
}

const wrap = wrapResponse<Proposal>(new CreateProposalResponseWrap());

@Resolver()
export class CreateProposalMutation {
  @Mutation(() => CreateProposalResponseWrap, { nullable: true })
  createProposal(@Ctx() context: ResolverContext) {
    return wrap(context.mutations.proposal.create(context.user));
  }
}
