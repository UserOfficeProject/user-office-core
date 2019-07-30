import database from "./database";
import { ProposalRecord } from "./records";

import { ProposalDataSource } from "../ProposalDataSource";
import { Proposal } from "../../models/Proposal";
import { Review } from "../../models/Review";

const BluePromise = require("bluebird");

export default class PostgresProposalDataSource implements ProposalDataSource {
  private createProposalObject(proposal: ProposalRecord) {
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

  async getProposals(filter?: string, first?: number, offset?: number) {
    return database
      .select(["*", database.raw("count(*) OVER() AS full_count")])
      .from("proposals")
      .orderBy("proposal_id", "desc")
      .modify((query: any) => {
        if (filter) {
          query
            .where("title", "ilike", `%${filter}%`)
            .orWhere("abstract", "ilike", `%${filter}%`);
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map(proposal =>
          this.createProposalObject(proposal)
        );
        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props
        };
      });
  }

  async getUserProposals(id: number) {
    return database
      .select("p.*")
      .from("proposals as p")
      .leftJoin("proposal_user as pc", {
        "p.proposal_id": "pc.proposal_id"
      })
      .where("pc.user_id", id)
      .orWhere("p.proposer_id", id)
      .then((proposals: ProposalRecord[]) =>
        proposals.map(proposal => this.createProposalObject(proposal))
      );
  }

  async submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | null> {
    return database
      .update(
        {
          comment,
          grade
        },
        ["*"]
      )
      .from("reviews")
      .where("review_id", reviewID)
      .then((review: any) => {
        console.log(review);
        return new Review(
          reviewID,
          review[0].proposal_id,
          review[0].user_id,
          comment,
          grade,
          0
        );
      });
  }

  async getProposalReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from("reviews")
      .where("proposal_id", id)
      .then((reviews: any[]) => {
        return reviews.map(
          review =>
            new Review(
              id,
              review.proposal_id,
              review.user_id,
              review.comment,
              review.grade,
              review.status
            )
        );
      })
      .catch(() => {
        return [];
      });
  }
}
