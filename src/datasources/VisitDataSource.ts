import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { Visit } from '../models/Visit';
import { VisitRegistration } from '../models/VisitRegistration';
import { GetRegistrationsFilter } from '../queries/VisitQueries';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../resolvers/mutations/UpdateVisitRegistration';
import { CreateVisitArgs } from './../resolvers/mutations/CreateVisitMutation';
import { VisitsFilter } from './../resolvers/queries/VisitsQuery';

export interface VisitDataSource {
  // Read
  getVisit(visitId: number): Promise<Visit | null>;
  getVisits(filter?: VisitsFilter): Promise<Visit[]>;
  getRegistration(
    userId: number,
    visitId: number
  ): Promise<VisitRegistration | null>;
  getRegistrations(
    filter: GetRegistrationsFilter
  ): Promise<VisitRegistration[]>;
  getVisitByScheduledEventId(eventId: number): Promise<Visit | null>;
  getEsiByVisitId(visitId: any): Promise<ExperimentSafetyInput | null>;
  // Write
  createVisit(
    args: CreateVisitArgs,
    creatorId: number,
    proposalPk: number
  ): Promise<Visit>;
  updateVisit(args: UpdateVisitArgs): Promise<Visit>;
  updateRegistration(
    userId: number,
    args: UpdateVisitRegistrationArgs
  ): Promise<VisitRegistration>;
  deleteVisit(visitId: number): Promise<Visit>;
  isVisitorOfProposal(visitorId: number, proposalPk: number): Promise<boolean>;
  isVisitorOfVisit(visitorId: number, visitId: number): Promise<boolean>;
  getRelatedUsersOnVisits(id: number): Promise<number[]>;
}
