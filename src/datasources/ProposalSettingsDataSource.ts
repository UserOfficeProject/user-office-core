/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { CreateProposalStatusArgs } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowArgs } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';

export interface ProposalSettingsDataSource {
  createProposalStatus(args: CreateProposalStatusArgs): Promise<ProposalStatus>;
  getProposalStatus(proposalStatusId: number): Promise<ProposalStatus | null>;
  getAllProposalStatuses(): Promise<ProposalStatus[]>;
  updateProposalStatus(proposalStatus: ProposalStatus): Promise<ProposalStatus>;
  deleteProposalStatus(proposalStatusId: number): Promise<ProposalStatus>;
  createProposalWorkflow(
    args: CreateProposalWorkflowArgs
  ): Promise<ProposalWorkflow>;
  getProposalWorkflow(
    proposalWorkflowId: number
  ): Promise<ProposalWorkflow | null>;
  getAllProposalWorkflows(): Promise<ProposalWorkflow[]>;
  updateProposalWorkflow(
    proposalWorkflow: ProposalWorkflow
  ): Promise<ProposalWorkflow>;
  deleteProposalWorkflow(proposalWorkflowId: number): Promise<ProposalWorkflow>;
}
