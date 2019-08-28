// Interfaces corresponding exactly to database tables

export interface ProposalUserRecord {
  readonly proposal_id: number;
  readonly user_id: number;
}

export interface ProposalRecord {
  [x: string]: any;
  readonly proposal_id: number;
  readonly title: string;
  readonly abstract: string;
  readonly proposer_id: number;
  readonly status: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly full_count: number;
}

export interface UserRecord {
  readonly user_id: number;
  readonly user_title: string;
  readonly firstname: string;
  readonly middlename: string;
  readonly lastname: string;
  readonly username: string;
  readonly preferredname: string;
  readonly orcid: string;
  readonly gender: string;
  readonly nationality: string;
  readonly birthdate: string;
  readonly organisation: string;
  readonly department: string;
  readonly organisation_address: string;
  readonly position: string;
  readonly email: string;
  readonly telephone: string;
  readonly telephone_alt: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
}

export interface RoleRecord {
  readonly role_id: number;
  readonly short_code: string;
  readonly title: string;
}

export interface ReviewRecord {
  readonly review_id: number;
  readonly user_id: number;
  readonly proposal_id: number;
  readonly comment: string;
  readonly grade: number;
  readonly status: number;
}

export interface CallRecord {
  readonly call_id: number;
  readonly call_short_code: string;
  readonly start_call: Date;
  readonly end_call: Date;
  readonly start_review: Date;
  readonly end_review: Date;
  readonly start_notify: Date;
  readonly end_notify: Date;
  readonly cycle_comment: string;
  readonly survey_comment: string;
}
