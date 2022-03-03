import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Visit, VisitStatus } from '../../models/Visit';
import { VisitRegistration } from '../../models/VisitRegistration';
import { GetRegistrationsFilter } from '../../queries/VisitQueries';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../../resolvers/mutations/UpdateVisitRegistration';
import { VisitsFilter } from '../../resolvers/queries/VisitsQuery';
import { VisitDataSource } from '../VisitDataSource';
import { CreateVisitArgs } from './../../resolvers/mutations/CreateVisitMutation';
import { dummyUserWithRole } from './UserDataSource';

export class VisitDataSourceMock implements VisitDataSource {
  getEsiByVisitId(visitId: any): Promise<ExperimentSafetyInput | null> {
    throw new Error('Method not implemented.');
  }
  private visits: Visit[];
  private visitsHasVisitors: VisitRegistration[];
  init() {
    this.visits = [
      new Visit(
        1,
        1,
        VisitStatus.SUBMITTED,
        1,
        dummyUserWithRole.id,
        1,
        new Date()
      ),
      new Visit(
        3,
        3,
        VisitStatus.SUBMITTED,
        3,
        dummyUserWithRole.id,
        3,
        new Date()
      ),
      new Visit(
        4,
        4,
        VisitStatus.SUBMITTED,
        4,
        dummyUserWithRole.id,
        4,
        new Date()
      ),
    ];

    this.visitsHasVisitors = [
      new VisitRegistration(
        1,
        1,
        1,
        false,
        new Date(),
        new Date(),
        new Date('2033-07-19T00:00:00.0000')
      ),
    ];
  }

  async getVisit(visitId: number): Promise<Visit | null> {
    return this.visits.find((visit) => visit.id === visitId) ?? null;
  }
  async getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    return this.visits.reduce((matchingVisits, currentVisit) => {
      if (filter?.creatorId && currentVisit.creatorId === filter.creatorId) {
        matchingVisits.push(currentVisit);
      }

      if (filter?.proposalPk && currentVisit.proposalPk === filter.proposalPk) {
        matchingVisits.push(currentVisit);
      }

      if (
        filter?.scheduledEventId &&
        currentVisit.scheduledEventId === filter.scheduledEventId
      ) {
        matchingVisits.push(currentVisit);
      }

      return matchingVisits;
    }, new Array<Visit>());
  }

  async getVisitByScheduledEventId(eventId: number): Promise<Visit | null> {
    return (
      this.visits.find((visit) => visit.scheduledEventId === eventId) ?? null
    );
  }

  async getRegistration(
    userId: number,
    visitId: number
  ): Promise<VisitRegistration | null> {
    return (
      this.visitsHasVisitors.find(
        (registration) =>
          registration.userId === userId && registration.visitId === visitId
      ) || null
    );
  }
  getRegistrations(
    filter: GetRegistrationsFilter
  ): Promise<VisitRegistration[]> {
    throw new Error('Method not implemented');
  }

  async createVisit(
    { teamLeadUserId, scheduledEventId: scheduledEventId }: CreateVisitArgs,
    creatorId: number,
    proposalPk: number
  ): Promise<Visit> {
    const newVisit = new Visit(
      this.visits.length,
      proposalPk,
      VisitStatus.DRAFT,
      creatorId,
      teamLeadUserId,
      scheduledEventId,
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
  updateRegistration(
    userId: number,
    args: UpdateVisitRegistrationArgs
  ): Promise<VisitRegistration> {
    throw new Error('Method not implemented');
  }
  async deleteVisit(visitId: number): Promise<Visit> {
    return this.visits.splice(
      this.visits.findIndex((visit) => visit.id == visitId),
      1
    )[0];
  }

  async isVisitorOfProposal(
    visitorId: number,
    proposalPk: number
  ): Promise<boolean> {
    return false;
  }

  async isVisitorOfVisit(visitorId: number, visitId: number): Promise<boolean> {
    return this.visitsHasVisitors.find(
      (registration) =>
        registration.userId === visitorId && registration.visitId === visitId
    )
      ? true
      : false;
  }

  async getRelatedUsersOnVisits(id: number): Promise<number[]> {
    return [];
  }
}
