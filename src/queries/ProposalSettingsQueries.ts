import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized } from '../decorators';
import { ProposalWorkflowConnection } from '../models/ProposalWorkflowConnections';
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

  // groupBy(
  //   arr: ProposalWorkflowConnection[],
  //   key: string
  // ): {
  //   groupId: string;
  //   previousGroupId: string;
  //   connections: ProposalWorkflowConnection[];
  // } {
  //   const newArr = [];
  //   const Keys = {};
  //   let cur: any;
  //   for (let i = 0, j = arr.length; i < j; i++) {
  //     cur = arr[i];
  //     if (!(cur[key] in Keys)) {
  //       Keys[cur[key]] = {
  //         groupId: cur[key],
  //         previousGroupId:
  //           arr.find(
  //             element => element.proposalStatusId === cur.prevProposalStatusId
  //           )?.droppableGroupId || null,
  //         connections: [],
  //       } as {
  //         groupId: string;
  //         previousGroupId: string;
  //         connections: ProposalWorkflowConnection[];
  //       };
  //       newArr.push(Keys[cur[key]]);
  //     }
  //     Keys[cur[key]].connections.push(cur);
  //   }

  //   return newArr;
  // }

  getUniqueDroppableGroupIds(list: ProposalWorkflowConnection[]) {
    const flags = new Set();

    return (
      list
        .map(item => ({
          droppableGroupId: item.droppableGroupId,
          prevProposalStatusId: item.prevProposalStatusId,
        }))
        // remove duplicates
        .filter(item => {
          if (flags.has(item.droppableGroupId)) {
            return false;
          }
          flags.add(item.droppableGroupId);

          return true;
        })
    );
  }

  groupProposalWorkflowConnectionsByDroppableArea(
    proposalWorkflowConnections: ProposalWorkflowConnection[]
  ) {
    const groupedProposalWorkflowConnections = this.getUniqueDroppableGroupIds(
      proposalWorkflowConnections
    ).map(item => ({
      groupId: item.droppableGroupId,
      previousGroupId:
        proposalWorkflowConnections.find(
          element => element.proposalStatusId === item.prevProposalStatusId
        )?.droppableGroupId || null,
      connections: proposalWorkflowConnections.filter(
        proposalWorkflowConnection =>
          proposalWorkflowConnection.droppableGroupId === item.droppableGroupId
      ),
    }));

    return groupedProposalWorkflowConnections;
  }

  @Authorized([Roles.USER_OFFICER])
  async proposalWorkflowConnectionGroups(
    agent: UserWithRole | null,
    proposalWorkflowId: number
  ) {
    const proposalWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
      proposalWorkflowId
    );

    const groupedProposalWorkflowConnections = this.groupProposalWorkflowConnectionsByDroppableArea(
      proposalWorkflowConnections
    );

    return groupedProposalWorkflowConnections;
  }
}
