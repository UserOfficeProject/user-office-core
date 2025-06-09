import { VisitRegistrationClaim } from '../models/VisitRegistrationClaim';

export interface VisitRegistrationClaimDataSource {
  create(inviteId: number, visitId: number): Promise<VisitRegistrationClaim>;
  findByInviteId(inviteId: number): Promise<VisitRegistrationClaim>;
  findByVisitId(visitId: number): Promise<VisitRegistrationClaim[]>;
}
