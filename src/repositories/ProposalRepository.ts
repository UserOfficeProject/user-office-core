import Proposal from "../models/Proposal";
import database from "../database";
import BluePromise from "bluebird";

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

  async create(abstract: string, status: number, users: Array<number>) {
    var id: any = null;
    return database.transaction(function(trx: { commit: any; rollback: any }) {
      return database
        .insert({
          abstract: abstract,
          status: status
        })
        .returning("proposal_id")
        .into("proposals")
        .transacting(trx)
        .then(function(proposal_id: Array<number>) {
          id = proposal_id[0];
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_id: id, user_id: user_id })
              .into("proposal_user")
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
          return id;
        })
        .catch(() => {
          trx.rollback;
          return null;
        });
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
