import Proposal from "../models/Proposal";
import database from "../database";

export default class ProposalRepository {
  async get(id: number) {
    return database
      .select()
      .from("proposals")
      .where("proposal_id", id)
      .first()
      .then(
        (proposal: { proposal_id: number; abstract: string; status: number }) =>
          new Proposal(proposal.proposal_id, proposal.abstract, proposal.status)
      );
  }

  async create(abstract: string, status: number) {
    return database
      .insert({
        abstract: abstract,
        status: status
      })
      .returning("proposal_id")
      .into("proposals")
      .then((proposal_id: Array<number>) => {
        return proposal_id[0];
      });
  }

  async getProposals() {
    return database
      .select()
      .from("proposals")
      .then((proposals: Array<any>) =>
        proposals.map(
          proposal =>
            new Proposal(
              proposal.proposal_id,
              proposal.abstract,
              proposal.status
            )
        )
      );
  }

  async getUserProposals(id: number) {
    return database
      .select()
      .from("proposals as p")
      .join("proposal_user as pc", { "p.proposal_id": "pc.proposal_id" })
      .join("users as u", { "u.user_id": "pc.user_id" })
      .where("u.user_id", id)
      .then((proposals: Array<any>) =>
        proposals.map(
          proposal =>
            new Proposal(
              proposal.proposal_id,
              proposal.abstract,
              proposal.status
            )
        )
      );
  }
}
