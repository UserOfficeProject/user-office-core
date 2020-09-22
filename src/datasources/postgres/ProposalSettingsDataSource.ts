/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow } from '../../models/ProposalWorkflow';
import { CreateProposalStatusInput } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';
import database from './database';
import { ProposalStatusRecord, ProposalWorkflowRecord } from './records';

export default class PostgresProposalSettingsDataSource
  implements ProposalSettingsDataSource {
  // ----------- Proposal statuses ---------->
  private createProposalStatusObject(proposalStatus: ProposalStatusRecord) {
    return new ProposalStatus(
      proposalStatus.proposal_status_id,
      proposalStatus.name,
      proposalStatus.description
    );
  }

  async createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus> {
    return database
      .insert(newProposalStatusInput)
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
  // <---------- Proposal statuses -----------

  // ----------- Proposal workflows ---------->
  private createProposalWorkflowObject(
    proposalWorkflow: ProposalWorkflowRecord
  ) {
    return new ProposalWorkflow(
      proposalWorkflow.proposal_workflow_id,
      proposalWorkflow.name,
      proposalWorkflow.description
    );
  }

  async createProposalWorkflow(
    args: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow> {
    return database
      .insert(args)
      .into('proposal_workflows')
      .returning(['*'])
      .then((proposalWorkflow: ProposalWorkflowRecord[]) => {
        if (proposalWorkflow.length !== 1) {
          throw new Error('Could not create proposal status');
        }

        return this.createProposalWorkflowObject(proposalWorkflow[0]);
      });
  }

  async getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null> {
    return database
      .select()
      .from('proposal_workflows')
      .where('proposal_workflow_id', proposalWorkflowId)
      .first()
      .then((proposalWorkflow: ProposalWorkflowRecord | null) =>
        proposalWorkflow
          ? this.createProposalWorkflowObject(proposalWorkflow)
          : null
      );
  }

  async getAllProposalWorkflows(): Promise<ProposalWorkflow[]> {
    return database
      .select('*')
      .from('proposal_workflows')
      .orderBy('proposal_workflow_id', 'asc')
      .then((proposalWorkflows: ProposalWorkflowRecord[]) => {
        return proposalWorkflows.map(proposalWorkflow =>
          this.createProposalWorkflowObject(proposalWorkflow)
        );
      });
  }

  async updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow> {
    return database
      .update(
        {
          proposal_workflow_id: proposalWorkflow.id,
          name: proposalWorkflow.name,
          description: proposalWorkflow.description,
        },
        ['*']
      )
      .from('proposal_workflows')
      .where('proposal_workflow_id', proposalWorkflow.id)
      .then((records: ProposalWorkflowRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal workflow not found ${proposalWorkflow.id}`);
        }

        return this.createProposalWorkflowObject(records[0]);
      });
  }

  async deleteProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow> {
    return database('proposal_workflows')
      .where('proposal_workflow_id', proposalWorkflowId)
      .del()
      .returning('*')
      .then((proposalWorkflow: ProposalWorkflowRecord[]) => {
        if (proposalWorkflow === undefined || proposalWorkflow.length !== 1) {
          throw new Error(
            `Could not delete proposal workflow with id: ${proposalWorkflowId} `
          );
        }

        return this.createProposalWorkflowObject(proposalWorkflow[0]);
      });
  }
  // <---------- Proposal workflows -----------
}
