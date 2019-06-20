import database from "./database";
import { ProposalDataSource } from "../ProposalDataSource";
import Proposal from "../../models/Proposal";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  setStatusProposal(id: number, status: number): Promise<Proposal | null> {
    return database
      .update(
        {
          status
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
              title: string;
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
            proposal[0].title,
            proposal[0].abstract,
            proposal[0].status
          );
        }
      );
  }

  public submitProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 1);
  }
  public acceptProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 2);
  }
  public rejectProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 3);
  }

  public setProposalUsers(id: number, users: number[]): boolean {
    return database.transaction(function(trx: { commit: any; rollback: any }) {
      return database
        .from("proposal_user")
        .where("proposal_id", id)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_id: id, user_id: user_id })
              .into("proposal_user")
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
          return true;
        })
        .catch(() => {
          trx.rollback;
          return false;
        });
    });
  }

  public update(proposal: Proposal): Promise<Proposal | null> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          status: proposal.status
        },
        ["proposal_id", "title", "abstract", "status"]
      )
      .from("proposals")
      .where("proposal_id", proposal.id)
      .then(
        (
          proposal: [
            {
              proposal_id: number;
              title: string;
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
            proposal[0].title,
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
        (proposal: {
          proposal_id: number;
          title: string;
          abstract: string;
          status: number;
        }) =>
          new Proposal(
            proposal.proposal_id,
            proposal.title,
            proposal.abstract,
            proposal.status
          )
      );
  }

  async create() {
    return database
      .insert({})
      .into("proposals")
      .returning("proposal_id")
      .then((id: number[]) => {
        return new Proposal(id[0], "null", "null", 0);
      })
      .catch(() => {
        console.log("asdad");
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
              proposal.title,
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
              proposal.title,
              proposal.abstract,
              proposal.status
            )
        )
      );
  }
}
