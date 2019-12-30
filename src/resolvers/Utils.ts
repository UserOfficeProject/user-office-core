import { isRejection, Rejection, rejection } from "../rejection";
import { ObjectType, Field } from "type-graphql";
import { Proposal } from "../models/Proposal";
import { ResolverContext } from "../context";
import { ProposalInformation } from "../models/ProposalModel";

@ObjectType()
export abstract class AbstractResponseWrap<T> {
  @Field(() => String, { nullable: true })
  public error: string;
  abstract setValue(value: T): void; // Must implement in subclass
}

export function wrapResponse<T>(wrapper: AbstractResponseWrap<T>) {
  return async function(promise: Promise<T | Rejection>) {
    const result = await promise;
    isRejection(result)
      ? (wrapper.error = result.reason)
      : wrapper.setValue(result);
    return wrapper;
  };
}

export async function resolveProposal(
  proposal: Proposal | null,
  context: ResolverContext
) {
  if (proposal == null) {
    return rejection("PROPOSAL_DOES_NOT_EXIST");
  }
  const { id, title, abstract, status, created, updated, shortCode } = proposal;
  const agent = context.user;

  if (!agent) {
    return rejection("NOT_AUTHORIZED");
  }

  const users = await context.queries.user.getProposers(agent, id);
  if (isRejection(users)) {
    return users;
  }

  const proposer = await context.queries.user.getBasic(
    agent,
    proposal.proposerId
  );
  if (proposer === null) {
    return rejection("NO_PROPOSER_ON_THE_PROPOSAL");
  }

  const reviews = await context.queries.review.reviewsForProposal(agent, id);
  if (isRejection(reviews)) {
    return reviews;
  }

  const questionary = await context.queries.proposal.getQuestionary(agent, id);
  if (isRejection(questionary)) {
    return questionary;
  }

  return new ProposalInformation(
    id,
    title,
    abstract,
    proposer,
    status,
    created,
    updated,
    users,
    reviews,
    questionary!,
    shortCode
  );
}
