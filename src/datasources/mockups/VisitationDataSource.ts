import { BasicUserDetails } from '../../models/User';
import { Visitation, VisitationStatus } from '../../models/Visitation';
import { UpdateVisitationArgs } from '../../resolvers/mutations/UpdateVisitationMutation';
import { VisitationsFilter } from '../../resolvers/queries/VisitationsQuery';
import { VisitationDataSource } from './../VisitationDataSource';
import { dummyUserWithRole } from './UserDataSource';

export class VisitationDataSourceMock implements VisitationDataSource {
  private visits: Visitation[];
  init() {
    this.visits = [
      new Visitation(
        1,
        1,
        VisitationStatus.DRAFT,
        1,
        dummyUserWithRole.id,
        new Date()
      ),
    ];
  }

  async getVisitation(visitationId: number): Promise<Visitation | null> {
    return this.visits.find((visit) => visit.id === visitationId) ?? null;
  }
  getVisitations(filter?: VisitationsFilter): Promise<Visitation[]> {
    throw new Error('Method not implemented.');
  }
  getTeam(visitationId: number): Promise<BasicUserDetails[]> {
    throw new Error('Method not implemented.');
  }
  async createVisitation(
    proposalId: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visitation> {
    const newVisit = new Visitation(
      this.visits.length,
      proposalId,
      VisitationStatus.DRAFT,
      questionaryId,
      visitorId,
      new Date()
    );

    this.visits.push(newVisit);

    return newVisit;
  }
  async updateVisitation(args: UpdateVisitationArgs): Promise<Visitation> {
    this.visits = this.visits.map((visit) => {
      if (visit && visit.id === args.visitationId) {
        args.status && (visit.status = args.status);
      }

      return visit;
    });

    return (await this.getVisitation(args.visitationId))!;
  }
  async deleteVisitation(visitationId: number): Promise<Visitation> {
    return this.visits.splice(
      this.visits.findIndex((visit) => visit.id == visitationId),
      1
    )[0];
  }
}
