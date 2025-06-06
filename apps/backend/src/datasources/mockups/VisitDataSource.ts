import { Visit } from '../../models/Visit';
import {
  VisitRegistration,
  VisitRegistrationStatus,
} from '../../models/VisitRegistration';
import { GetRegistrationsFilter } from '../../queries/VisitQueries';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../../resolvers/mutations/UpdateVisitRegistrationMutation';
import { VisitsFilter } from '../../resolvers/queries/VisitsQuery';
import { VisitDataSource } from '../VisitDataSource';
import { CreateVisitArgs } from './../../resolvers/mutations/CreateVisitMutation';
import { dummyUserWithRole } from './UserDataSource';

export class VisitDataSourceMock implements VisitDataSource {
  private visits: Visit[];
  private visitsHasVisitors: VisitRegistration[];
  init() {
    this.visits = [
      new Visit(1, 1, 1, dummyUserWithRole.id, new Date(), 1),
      new Visit(3, 3, 3, dummyUserWithRole.id, new Date(), 3),
      new Visit(4, 4, 4, dummyUserWithRole.id, new Date(), 4),
    ];

    this.visitsHasVisitors = [
      new VisitRegistration(
        1,
        1,
        1,
        new Date(),
        new Date(),
        VisitRegistrationStatus.DRAFTED
      ),
      new VisitRegistration(
        1,
        2,
        2,
        new Date(),
        new Date(),
        VisitRegistrationStatus.DRAFTED
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
        filter?.experimentPk &&
        currentVisit.experimentPk === filter.experimentPk
      ) {
        matchingVisits.push(currentVisit);
      }

      return matchingVisits;
    }, new Array<Visit>());
  }

  async getVisitByExperimentPk(experimentPk: number): Promise<Visit | null> {
    return (
      this.visits.find((visit) => visit.experimentPk === experimentPk) ?? null
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
    { teamLeadUserId, experimentPk }: CreateVisitArgs,
    creatorId: number,
    proposalPk: number
  ): Promise<Visit> {
    const newVisit = new Visit(
      this.visits.length,
      proposalPk,
      creatorId,
      teamLeadUserId,
      new Date(),
      experimentPk
    );

    this.visits.push(newVisit);

    return newVisit;
  }

  async updateVisit(args: UpdateVisitArgs): Promise<Visit> {
    this.visits = this.visits.map((visit) => {
      if (visit && visit.id === args.visitId) {
        visit.teamLeadUserId = args.teamLeadUserId ?? visit.teamLeadUserId;
      }

      this.visitsHasVisitors = this.visitsHasVisitors.filter(
        (registration) => registration.visitId !== args.visitId
      );

      args.team?.forEach((userId) => {
        this.visitsHasVisitors.push(
          new VisitRegistration(
            this.visitsHasVisitors.length,
            userId,
            args.visitId,
            new Date(),
            new Date(),
            VisitRegistrationStatus.DRAFTED
          )
        );
      });

      return visit;
    });

    return (await this.getVisit(args.visitId))!;
  }
  async updateRegistration(
    args: UpdateVisitRegistrationArgs
  ): Promise<VisitRegistration> {
    const registration = await this.getRegistration(args.userId, args.visitId);

    if (registration) {
      registration.startsAt = args.startsAt ?? registration.startsAt;
      registration.endsAt = args.endsAt ?? registration.endsAt;
      registration.status = args.status ?? registration.status;

      return registration;
    } else {
      throw new Error('Registration not found');
    }
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
    if (proposalPk === 1 && visitorId === 102) return true;

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
