import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Arg,
  Int
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../../models/Proposal";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
class RejectProposalResponseWrap extends AbstractResponseWrap<Proposal> {
  @Field(type => Proposal, { nullable: true })
  public proposal: Proposal;
  setValue(value: Proposal): void {
    this.proposal = value;
  }
}

const wrap = wrapResponse<Proposal>(new RejectProposalResponseWrap());

@Resolver()
export class SubmitProposalMutation {
  @Mutation(() => RejectProposalResponseWrap, { nullable: true })
  rejectProposal(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrap(context.mutations.proposal.reject(context.user, id));
  }
}
