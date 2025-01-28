import { ProposalStatus } from '../../models/ProposalStatus';
import { ProposalWorkflow, Workflow } from '../../models/ProposalWorkflow';
import {
  ProposalWorkflowConnection,
  WorkflowConnectionWithStatus,
} from '../../models/WorkflowConnections';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';

export const dummyProposalStatuses = [
  new ProposalStatus(1, 'DRAFT', 'Draft', '', true),
  new ProposalStatus(2, 'FEASIBILITY_REVIEW', 'Feasibility review', '', true),
];

export const dummyWorkflow = new Workflow(
  1,
  'Test workflow',
  'This is description',
  'proposal'
);

export const dummyWorkflowConnection = new WorkflowConnectionWithStatus(
  1,
  1,
  1,
  1,
  {
    id: 1,
    shortCode: 'TEST_STATUS',
    name: 'Test status',
    description: 'Test status',
    isDefault: false,
    entityType: 'proposal',
  },
  null,
  null,
  'proposalWorkflowConnections_0',
  null
);

export const anotherProposalWorkflowConnection = new ProposalWorkflowConnection(
  2,
  2,
  1,
  2,
  {
    id: 2,
    shortCode: 'TEST_STATUS_2',
    name: 'Test status 2',
    description: 'Test status 2',
    isDefault: false,
  },
  null,
  1,
  'proposalWorkflowConnections_0',
  null
);

export class ProposalSettingsDataSourceMock
  implements ProposalSettingsDataSource
{
  async getProposalWorkflowByCall(
    callId: number
  ): Promise<ProposalWorkflow | null> {
    return dummyWorkflow;
  }
}
