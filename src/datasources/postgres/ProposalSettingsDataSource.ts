/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow } from '../../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../../models/ProposalWorkflowConnections';
import { AddProposalWorkflowStatusInput } from '../../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';
import database from './database';
import {
  ProposalStatusRecord,
  ProposalWorkflowConnectionRecord,
  ProposalWorkflowRecord,
} from './records';

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

  private createProposalWorkflowConnectionObject(
    proposalWorkflowConnection: ProposalWorkflowConnectionRecord &
      ProposalStatusRecord
  ) {
    return new ProposalWorkflowConnection(
      proposalWorkflowConnection.proposal_workflow_connection_id,
      proposalWorkflowConnection.sort_order,
      proposalWorkflowConnection.proposal_workflow_id,
      proposalWorkflowConnection.proposal_status_id,
      {
        id: proposalWorkflowConnection.proposal_status_id,
        name: proposalWorkflowConnection.name,
        description: proposalWorkflowConnection.description,
      },
      proposalWorkflowConnection.next_proposal_status_id,
      proposalWorkflowConnection.prev_proposal_status_id,
      proposalWorkflowConnection.next_status_event_type
    );
  }

  async getProposalWorkflowConnections(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflowConnection[]> {
    return database
      .select('*')
      .from('proposal_workflow_connections as pwc')
      .join('proposal_statuses as ps', {
        'ps.proposal_status_id': 'pwc.proposal_status_id',
      })
      .where('proposal_workflow_id', proposalWorkflowId)
      .orderBy('sort_order')
      .then(
        (
          proposalWorkflowConnections:
            | (ProposalWorkflowConnectionRecord & ProposalStatusRecord)[]
            | null
        ) =>
          proposalWorkflowConnections
            ? proposalWorkflowConnections.map(proposalWorkflowConnection =>
                this.createProposalWorkflowConnectionObject(
                  proposalWorkflowConnection
                )
              )
            : []
      );
  }

  async getProposalWorkflowConnection(
    proposalWorkflowId: number,
    proposalStatusId: number
  ): Promise<ProposalWorkflowConnection | null> {
    return database
      .select()
      .from('proposal_workflow_connections as pwc')
      .join('proposal_statuses as ps', {
        'ps.proposal_status_id': 'pwc.proposal_status_id',
      })
      .where('proposal_workflow_id', proposalWorkflowId)
      .andWhere('pwc.proposal_status_id', proposalStatusId)
      .first()
      .then(
        (
          proposalWorkflowConnection:
            | (ProposalWorkflowConnectionRecord & ProposalStatusRecord)
            | null
        ) =>
          proposalWorkflowConnection
            ? this.createProposalWorkflowConnectionObject(
                proposalWorkflowConnection
              )
            : null
      );
  }

  async addProposalWorkflowStatus(
    newProposalWorkflowStatusInput: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection> {
    return database
      .insert({
        proposal_workflow_id: newProposalWorkflowStatusInput.proposalWorkflowId,
        proposal_status_id: newProposalWorkflowStatusInput.proposalStatusId,
        next_proposal_status_id:
          newProposalWorkflowStatusInput.nextProposalStatusId,
        prev_proposal_status_id:
          newProposalWorkflowStatusInput.prevProposalStatusId,
        sort_order: newProposalWorkflowStatusInput.sortOrder,
        next_status_event_type:
          newProposalWorkflowStatusInput.nextStatusEventType,
      })
      .into('proposal_workflow_connections as pwc')
      .returning(['*'])
      .join('proposal_statuses as ps', {
        'ps.proposal_status_id':
          newProposalWorkflowStatusInput.proposalStatusId,
      })
      .then(
        (
          proposalWorkflowConnections: (ProposalWorkflowConnectionRecord &
            ProposalStatusRecord)[]
        ) => {
          if (proposalWorkflowConnections.length !== 1) {
            throw new Error('Could not create proposal workflow status');
          }

          return this.createProposalWorkflowConnectionObject(
            proposalWorkflowConnections[0]
          );
        }
      );
  }

  async bulkUpdateProposalWorkflowStatuses(
    collection: ProposalWorkflowConnection[]
  ) {
    return database.transaction(trx => {
      const queries = collection.map(tuple =>
        database('proposal_workflow_connections')
          .where('proposal_workflow_id', tuple.proposalWorkflowId)
          .andWhere('proposal_status_id', tuple.proposalStatusId)
          .update({
            proposal_workflow_id: tuple.proposalWorkflowId,
            proposal_status_id: tuple.proposalStatusId,
            next_proposal_status_id: tuple.nextProposalStatusId,
            prev_proposal_status_id: tuple.prevProposalStatusId,
            sort_order: tuple.sortOrder,
            next_status_event_type: tuple.nextStatusEventType,
          })
          .transacting(trx)
      );

      return Promise.all(queries)
        .then(trx.commit)
        .catch(error => {
          trx.rollback;
          throw error;
        });
    });
  }

  async updateProposalWorkflowStatuses(
    proposalWorkflowStatusesInput: ProposalWorkflowConnection[]
  ): Promise<boolean> {
    const result = await this.bulkUpdateProposalWorkflowStatuses(
      proposalWorkflowStatusesInput
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async deleteProposalWorkflowStatus(
    proposalStatusId: number,
    proposalWorkflowId: number
  ): Promise<boolean> {
    return database('proposal_workflow_connections')
      .where('proposal_workflow_id', proposalWorkflowId)
      .andWhere('proposal_status_id', proposalStatusId)
      .del()
      .returning('*')
      .then((proposalWorkflowStatus: ProposalWorkflowConnectionRecord[]) => {
        if (
          proposalWorkflowStatus === undefined ||
          proposalWorkflowStatus.length !== 1
        ) {
          throw new Error(
            `Could not delete proposal workflow status with id: ${proposalWorkflowId} `
          );
        }

        return true;
      });
  }
}
