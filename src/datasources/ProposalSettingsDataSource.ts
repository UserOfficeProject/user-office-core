/* eslint-disable @typescript-eslint/camelcase */
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';

export interface ProposalSettingsDataSource {
  createProposalStatus(
    newProposalStatusInput: CreateProposalStatusInput
  ): Promise<ProposalStatus>;
  getProposalStatus(proposalStatusId: number): Promise<ProposalStatus | null>;
  getAllProposalStatuses(): Promise<ProposalStatus[]>;
  updateProposalStatus(proposalStatus: ProposalStatus): Promise<ProposalStatus>;
  deleteProposalStatus(proposalStatusId: number): Promise<ProposalStatus>;
  createProposalWorkflow(
    newProposalWorkflowInput: CreateProposalWorkflowInput
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
