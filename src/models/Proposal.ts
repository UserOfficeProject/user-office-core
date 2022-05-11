/**
 * This status is given by system or manager to indicate
 * or override the final status of proposal
 */
export enum ProposalEndStatus {
  UNSET = 0,
  ACCEPTED,
  RESERVED,
  REJECTED,
}

/**
 * This status is visible to the proposal authors
 * It servers two purposes.
 * Firstly, hides internal status proposal has while
 * moving though the proposal workflow, which could have
 * sensitive information
 * Secondly gives clear and unserstandable indication
 * for the proposal authors
 */
export enum ProposalPublicStatus {
  draft = 'draft',
  submitted = 'submitted',
  accepted = 'accepted',
  rejected = 'rejected',
  unknown = 'unknown',
  reserved = 'reserved',
}

export class Proposal {
  constructor(
    public primaryKey: number,
    public title: string,
    public abstract: string,
    public proposerId: number,
    public statusId: number, // proposal status id while it moving though proposal workflow
    public created: Date,
    public updated: Date,
    public proposalId: string,
    public finalStatus: ProposalEndStatus,
    public callId: number,
    public questionaryId: number,
    public commentForUser: string,
    public commentForManagement: string,
    public notified: boolean,
    public submitted: boolean,
    public referenceNumberSequence: number,
    public managementTimeAllocation: number,
    public managementDecisionSubmitted: boolean
  ) {}
}

export class ProposalPksWithNextStatus {
  constructor(
    public proposalPks: number[],
    public id?: number,
    public shortCode?: string,
    public name?: string
  ) {}
}
