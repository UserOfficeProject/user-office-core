import database from "./database";
import { ProposalRecord } from "./records";

import { ProposalDataSource } from "../ProposalDataSource";
import { Proposal } from "../../models/Proposal";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  private createProposalObject(proposal: ProposalRecord) {
    console.log(proposal);
    return new Proposal(
      proposal.proposal_id,
      proposal.title,
      proposal.abstract,
      proposal.proposer_id,
      proposal.status,
      proposal.created_at,
      proposal.updated_at
    );
  }

  async setStatusProposal(
    id: number,
    status: number
  ): Promise<Proposal | null> {
    return database
      .update(
        {
          status
        },
        ["*"]
      )
      .from("proposals")
      .where("proposal_id", id)
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || !proposal.length) {
          return null;
        }
        return this.createProposalObject(proposal[0]);
      });
  }

  async submitProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 1);
  }
  async acceptProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 2);
  }
  async rejectProposal(id: number): Promise<Proposal | null> {
    return this.setStatusProposal(id, 3);
  }

  async setProposalUsers(id: number, users: number[]): Promise<Boolean> {
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

  async update(proposal: Proposal): Promise<Proposal | null> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          status: proposal.status
        },
        ["*"]
      )
      .from("proposals")
      .where("proposal_id", proposal.id)
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || !proposal.length) {
          return null;
        }
        return this.createProposalObject(proposal[0]);
      });
  }

  async get(id: number) {
    return database
      .select()
      .from("proposals")
      .where("proposal_id", id)
      .first()
      .then((proposal: ProposalRecord) => this.createProposalObject(proposal));
  }

  async create(proposerID: number) {
    return database
      .insert({ proposer_id: proposerID })
      .into("proposals")
      .returning(["*"])
      .then((proposal: ProposalRecord[]) => {
        return this.createProposalObject(proposal[0]);
      })
      .catch(() => {
        console.log("Should do something here");
      });
  }

  async getProposals(filter: string) {
    return database
      .select()
      .from("proposals")
      .modify((query: any) => {
        if (filter) {
          query
            .where("title", "ilike", `%${filter}%`)
            .orWhere("abstract", "ilike", `%${filter}%`);
        }
      })
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => this.createProposalObject(proposal))
      );
  }

  async getUserProposals(id: number) {
    return database
      .select()
      .from("proposals as p")
      .join("proposal_user as pc", { "p.proposal_id": "pc.proposal_id" })
      .join("users as u", { "u.user_id": "pc.user_id" })
      .where("u.user_id", id)
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => this.createProposalObject(proposal))
      );
  }
}
