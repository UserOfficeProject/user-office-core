import database from "./database";
import { ProposalDataSource } from "../ProposalDataSource";
import Proposal from "../../models/Proposal";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  public update(proposal: Proposal): Promise<Proposal | null> {
    return database
      .update(
        {
          abstract: proposal.abstract,
          status: proposal.status
        },
        ["proposal_id", "abstract", "status"]
      )
      .from("proposals")
      .where("proposal_id", proposal.id)
      .then(
        (
          proposal: [
            {
              proposal_id: number;
              abstract: string;
              status: number;
            }
          ]
        ) => {
          if (proposal === undefined || !proposal.length) {
            return null;
          }
          return new Proposal(
            proposal[0].proposal_id,
            proposal[0].abstract,
            proposal[0].status
          );
        }
      );
  }
  public acceptProposal(id: number): Promise<Proposal | null> {
    return database
      .update(
        {
          status: 5
        },
        ["proposal_id", "abstract", "status"]
      )
      .from("proposals")
      .where("proposal_id", id)
      .then(
        (
          proposal: [
            {
              proposal_id: number;
              abstract: string;
              status: number;
            }
          ]
        ) => {
          if (proposal === undefined || !proposal.length) {
            return null;
          }
          return new Proposal(
            proposal[0].proposal_id,
            proposal[0].abstract,
            proposal[0].status
          );
        }
      );
  }
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

  async create(abstract: string, status: number, users: number[]) {
    var id: any = null; // not happy with this
    return database.transaction(function(trx: { commit: any; rollback: any }) {
      return database
        .insert({
          abstract: abstract,
          status: status
        })
        .returning("proposal_id")
        .into("proposals")
        .transacting(trx)
        .then(function(proposalID: number[]) {
          id = proposalID[0];
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_id: id, user_id: user_id })
              .into("proposal_user")
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
          return new Proposal(id, abstract, status);
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
      .then((proposals: any[]) =>
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
      .then((proposals: any[]) =>
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
