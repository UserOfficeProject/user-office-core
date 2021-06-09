import { BasicUserDetails } from '../../models/User';
import { Visit, VisitStatus } from '../../models/Visit';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { VisitsFilter } from '../../resolvers/queries/VisitsQuery';
import { VisitDataSource } from '../VisitDataSource';
import { dummyUserWithRole } from './UserDataSource';

export class VisitDataSourceMock implements VisitDataSource {
  private visits: Visit[];
  init() {
    this.visits = [
      new Visit(1, 1, VisitStatus.DRAFT, 1, dummyUserWithRole.id, new Date()),
    ];
  }

  async getVisit(visitId: number): Promise<Visit | null> {
    return this.visits.find((visit) => visit.id === visitId) ?? null;
  }
  getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    throw new Error('Method not implemented.');
  }
  getTeam(visitId: number): Promise<BasicUserDetails[]> {
    throw new Error('Method not implemented.');
  }
  async createVisit(
    proposalId: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visit> {
    const newVisit = new Visit(
      this.visits.length,
      proposalId,
      VisitStatus.DRAFT,
      questionaryId,
      visitorId,
      new Date()
    );

    this.visits.push(newVisit);

    return newVisit;
  }
  async updateVisit(args: UpdateVisitArgs): Promise<Visit> {
    this.visits = this.visits.map((visit) => {
      if (visit && visit.id === args.visitId) {
        args.status && (visit.status = args.status);
      }

      return visit;
    });

    return (await this.getVisit(args.visitId))!;
  }
  async deleteVisit(visitId: number): Promise<Visit> {
    return this.visits.splice(
      this.visits.findIndex((visit) => visit.id == visitId),
      1
    )[0];
  }
}
