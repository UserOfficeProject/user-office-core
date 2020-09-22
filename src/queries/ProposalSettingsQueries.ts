import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

export default class ProposalSettingsQueries {
  constructor(private dataSource: ProposalSettingsDataSource) {}

  @Authorized()
  async getProposalStatus(agent: UserWithRole | null, id: number) {
    const proposalStatus = await this.dataSource.getProposalStatus(id);

    return proposalStatus;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllProposalStatuses(agent: UserWithRole | null) {
    const proposalStatuses = await this.dataSource.getAllProposalStatuses();

    return proposalStatuses;
  }

  async getProposalWorkflow(agent: UserWithRole | null, id: number) {
    const proposalWorkflow = await this.dataSource.getProposalWorkflow(id);

    return proposalWorkflow;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllProposalWorkflows(agent: UserWithRole | null) {
    const proposalWorkflows = await this.dataSource.getAllProposalWorkflows();

    return proposalWorkflows;
  }

  @Authorized([Roles.USER_OFFICER])
  async getProposalWorkflowConnections(agent: UserWithRole | null, id: number) {
    const proposalWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
      id
    );

    return proposalWorkflowConnections;
  }
}
