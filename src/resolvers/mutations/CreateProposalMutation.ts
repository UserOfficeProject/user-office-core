import { Resolver, ObjectType, Ctx, Mutation, Field } from "type-graphql";
import { ResolverContext } from "../../context";
import { Proposal } from "../../models/Proposal";
import { AbstractResponseWrap, wrapResponse, resolveProposal } from "../Utils";
import { isRejection } from "../../rejection";
import { ProposalInformation } from "../../models/ProposalModel";

@ObjectType()
class CreateProposalResponseWrap extends AbstractResponseWrap<
  ProposalInformation
> {
  @Field(() => ProposalInformation, { nullable: true })
  public proposal: ProposalInformation;

  setValue(value: ProposalInformation): void {
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
