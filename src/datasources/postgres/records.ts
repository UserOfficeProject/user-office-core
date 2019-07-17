// Interfaces corresponding exactly to database tables

export interface ProposalUserRecord {
  readonly proposal_id: number;
  readonly user_id: number;
}

export interface ProposalRecord {
  readonly proposal_id: number;
  readonly title: string;
  readonly abstract: string;
  readonly proposer_id: number;
  readonly status: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UserRecord {
  readonly user_id: number;
  readonly firstname: string;
  readonly lastname: string;
  readonly username: string;
}

export interface RoleRecord {
  readonly role_id: number;
  readonly short_code: string;
  readonly title: string;
}
