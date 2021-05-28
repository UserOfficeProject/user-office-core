import { BasicUserDetails } from '../models/User';
import { Visitation } from '../models/Visitation';
import { UpdateVisitationArgs } from '../resolvers/mutations/UpdateVisitationMutation';
import { VisitationsFilter } from './../resolvers/queries/VisitationsQuery';

export interface VisitationDataSource {
  // Read
  getVisitation(visitationId: number): Promise<Visitation | null>;
  getVisitations(filter?: VisitationsFilter): Promise<Visitation[]>;
  getTeam(visitationId: number): Promise<BasicUserDetails[]>;
  // Write
  createVisitation(
    proposalId: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visitation>;
  updateVisitation(args: UpdateVisitationArgs): Promise<Visitation>;
  deleteVisitation(visitationId: number): Promise<Visitation>;
}
