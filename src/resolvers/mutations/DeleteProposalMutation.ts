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
class DeleteProposalResponseWrap extends AbstractResponseWrap<Proposal> {
  @Field({ nullable: true })
  public proposal: Proposal;

  setValue(value: Proposal): void {
    this.proposal = value;
  }
}

const wrap = wrapResponse<Proposal>(new DeleteProposalResponseWrap());

@Resolver()
export class DeleteProposalMutation {
  @Mutation(() => DeleteProposalResponseWrap, { nullable: true })
  deleteProposal(
    @Arg("id", () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrap(context.mutations.proposal.delete(context.user, id));
  }
}
