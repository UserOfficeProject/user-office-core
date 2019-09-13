import database from "./database";
import { ProposalRecord } from "./records";

import { ProposalDataSource } from "../ProposalDataSource";
import {
  Proposal,
  ProposalTemplate,
  ProposalTemplateField,
  FieldDependency,
  Topic
} from "../../models/Proposal";

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

  async checkActiveCall(): Promise<Boolean> {
    const currentDate = new Date().toISOString();
    return database
      .select()
      .from("call")
      .where("start_call", "<=", currentDate)
      .andWhere("end_call", ">=", currentDate)
      .first()
      .then((call: any) => (call ? true : false));
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

  async updateAnswer(
    proposal_id: number,
    question_id: string,
    answer: string
  ): Promise<Boolean> {
    const results: { count: string } = await database
      .count()
      .from("proposal_answers")
      .where({
        proposal_id: proposal_id,
        proposal_question_id: question_id
      })
      .first();

    const hasEntry = results && results.count !== "0";
    if (hasEntry) {
      return database("proposal_answers")
        .update({
          answer: answer
        })
        .where({
          proposal_id: proposal_id,
          proposal_question_id: question_id
        });
    } else {
      return database
        .insert({
          proposal_id: proposal_id,
          proposal_question_id: question_id,
          answer: answer
        })
        .into("proposal_answers");
    }
  }

  async insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[] | null> {
    
    const answerId= await this.getAnswerId(proposal_id, question_id);
    if(!answerId)
    {
      return null;
    }

    await database("proposal_answers_files").insert(
      files.map(file => ({ answer_id: answerId, file_id: file }))
    );

    return files;
  }

  async deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<Boolean | null> 
  {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if(!answerId)
    {
      return null;
    }

    await database("proposal_answers_files")
      .where({ answer_id: answerId })
      .del();

    return true;
  }

  

  

  private async getAnswerId(proposal_id:number, question_id:string):Promise<number | null> {
   const selectResult = await database
      .from("proposal_answers")
      .where({
        proposal_id: proposal_id,
        proposal_question_id: question_id
      })
      .select("answer_id");

    if (!selectResult || selectResult.length != 1) {
      return null;
    }

    return selectResult[0].answer_id; 
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

  async getProposalTemplate(): Promise<ProposalTemplate> {
    const deps: FieldDependency[] = await database
      .select("*")
      .from("proposal_question_dependencies");

    const fields: ProposalTemplateField[] = await database
      .select("*")
      .from("proposal_questions");

    const topics: Topic[] = await database
      .select("p.*")
      .from("proposal_topics as p")
      .where("p.is_enabled", true)
      .orderBy("sort_order");

    topics.forEach(topic => {
      topic.fields = fields.filter(field => field.topic === topic.topic_id);
    });
    fields.forEach(field => {
      field.dependencies = deps.filter(
        dep => dep.proposal_question_id === field.proposal_question_id
      );
    });

    return new ProposalTemplate(topics);
  }
}
