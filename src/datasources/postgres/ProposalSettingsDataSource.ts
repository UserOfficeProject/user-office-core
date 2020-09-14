/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../../models/ProposalStatus';
import { CreateProposalStatusArgs } from '../../resolvers/mutations/CreateProposalStatusMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';
import database from './database';
import { ProposalStatusRecord } from './records';

export default class PostgresProposalSettingsDataSource
  implements ProposalSettingsDataSource {
  private createProposalStatusObject(proposalStatus: ProposalStatusRecord) {
    return new ProposalStatus(
      proposalStatus.proposal_status_id,
      proposalStatus.name,
      proposalStatus.description
    );
  }

  async createProposalStatus(
    args: CreateProposalStatusArgs
  ): Promise<ProposalStatus> {
    return database
      .insert(args)
      .into('proposal_statuses')
      .returning(['*'])
      .then((proposalStatus: ProposalStatusRecord[]) => {
        if (proposalStatus.length !== 1) {
          throw new Error('Could not create proposal status');
        }

        return this.createProposalStatusObject(proposalStatus[0]);
      });
  }

  async getProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus | null> {
    return database
      .select()
      .from('proposal_statuses')
      .where('proposal_status_id', proposalStatusId)
      .first()
      .then((proposalStatus: ProposalStatusRecord | null) =>
        proposalStatus ? this.createProposalStatusObject(proposalStatus) : null
      );
  }

  async getAllProposalStatuses(): Promise<ProposalStatus[]> {
    return database
      .select('*')
      .from('proposal_statuses')
      .orderBy('proposal_status_id', 'asc')
      .then((proposalStatuses: ProposalStatusRecord[]) => {
        return proposalStatuses.map(proposalStatus =>
          this.createProposalStatusObject(proposalStatus)
        );
      });
  }

  async updateProposalStatus(
    proposalStatus: ProposalStatus
  ): Promise<ProposalStatus> {
    return database
      .update(
        {
          proposal_status_id: proposalStatus.id,
          name: proposalStatus.name,
          description: proposalStatus.description,
        },
        ['*']
      )
      .from('proposal_statuses')
      .where('proposal_status_id', proposalStatus.id)
      .then((records: ProposalStatusRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`ProposalStatus not found ${proposalStatus.id}`);
        }

        return this.createProposalStatusObject(records[0]);
      });
  }

  async deleteProposalStatus(
    proposalStatusId: number
  ): Promise<ProposalStatus> {
    return database('proposal_statuses')
      .where('proposal_status_id', proposalStatusId)
      .del()
      .returning('*')
      .then((proposalStatus: ProposalStatusRecord[]) => {
        if (proposalStatus === undefined || proposalStatus.length !== 1) {
          throw new Error(
            `Could not delete proposalStatus with id: ${proposalStatusId} `
          );
        }

        return this.createProposalStatusObject(proposalStatus[0]);
      });
  }
}
