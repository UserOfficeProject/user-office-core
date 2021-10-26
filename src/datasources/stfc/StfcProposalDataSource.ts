import { injectable } from 'tsyringe';

import PostgresProposalDataSource from './../postgres/ProposalDataSource';
import { Proposal } from '../../models/Proposal';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import database from '../postgres/database';
import {
  createProposalObject,
  ProposalRecord,
} from '../postgres/records';

@injectable()
export default class StfcProposalDataSource extends PostgresProposalDataSource {
  async getInstrumentScientistProposals(
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select([
        '*',
        database.raw('count(*) OVER() AS full_count')
      ])
      .from('proposals') 
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }
}
