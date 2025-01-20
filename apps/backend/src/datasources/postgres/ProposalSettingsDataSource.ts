import { injectable } from 'tsyringe';

import { ProposalWorkflow, Workflow } from '../../models/ProposalWorkflow';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';
import database from './database';
import { WorkflowRecord } from './records';

@injectable()
export default class PostgresProposalSettingsDataSource
  implements ProposalSettingsDataSource
{
  private createProposalWorkflowObject(proposalWorkflow: WorkflowRecord) {
    return new Workflow(
      proposalWorkflow.workflow_id,
      proposalWorkflow.name,
      proposalWorkflow.description,
      proposalWorkflow.entity_type
    );
  }

  async getProposalWorkflowByCall(
    callId: number
  ): Promise<ProposalWorkflow | null> {
    return database
      .select()
      .from('call as c')
      .join('workflows as w', {
        'w.workflow_id': 'c.proposal_workflow_id',
      })
      .where('c.call_id', callId)
      .andWhere('w.entity_type', 'proposal')
      .first()
      .then((proposalWorkflow: WorkflowRecord | null) =>
        proposalWorkflow
          ? this.createProposalWorkflowObject(proposalWorkflow)
          : null
      );
  }
}
