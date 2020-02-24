import { Page } from "../../models/Admin";
import { FileMetadata } from "../../models/Blob";
import { Proposal } from "../../models/Proposal";
import {
  createConfigByType,
  DataType,
  FieldCondition,
  FieldDependency,
  ProposalTemplateField,
  QuestionaryField,
  Topic
} from "../../models/ProposalModel";
import { BasicUserDetails, User } from "../../models/User";

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
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
  readonly short_code: string;
  readonly excellence_score: number;
  readonly safety_score: number;
  readonly technical_score: number;
}

export interface TopicRecord {
  readonly topic_id: number;
  readonly topic_title: string;
  readonly is_enabled: boolean;
  readonly sort_order: number;
}

export interface FieldDependencyRecord {
  readonly proposal_question_id: string;
  readonly proposal_question_dependency: string;
  readonly condition: string;
}

export interface ProposalQuestionRecord {
  readonly proposal_question_id: string;
  readonly natural_key: string;
  readonly data_type: string;
  readonly question: string;
  readonly topic_id: number;
  readonly config: string;
  readonly sort_order: number;
  readonly created_at: Date;
  readonly updated_at: Date;
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
  readonly nationality: number;
  readonly birthdate: string;
  readonly organisation: number;
  readonly department: string;
  readonly organisation_address: string;
  readonly position: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly password: string;
  readonly telephone: string;
  readonly telephone_alt: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
  readonly institution: string;
  readonly placeholder: boolean;
  readonly orcid_refreshtoken: string;
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

export interface TechnicalReviewRecord {
  readonly technical_review_id: number;
  readonly proposal_id: number;
  readonly comment: string;
  readonly time_allocation: number;
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

export interface PagetextRecord {
  readonly pagetext_id: number;
  readonly content: string;
}

export interface NationalityRecord {
  readonly nationality_id: number;
  readonly nationality: string;
}

export interface InstitutionRecord {
  readonly institution_id: number;
  readonly institution: string;
  readonly verified: boolean;
}

export interface CountryRecord {
  readonly country_id: number;
  readonly country: string;
}

export interface FileRecord {
  readonly file_id: string;
  readonly file_name: string;
  readonly size_in_bytes: number;
  readonly mime_type: string;
  readonly oid: number;
  readonly created_at: Date;
}

export const createPageObject = (record: PagetextRecord) => {
  return new Page(record.pagetext_id, record.content);
};

export const createTopicObject = (proposal: TopicRecord) => {
  return new Topic(
    proposal.topic_id,
    proposal.topic_title,
    proposal.sort_order,
    proposal.is_enabled
  );
};

export const createProposalTemplateFieldObject = (
  question: ProposalQuestionRecord
) => {
  return new ProposalTemplateField(
    question.proposal_question_id,
    question.natural_key,
    question.data_type as DataType,
    question.sort_order,
    question.question,
    createConfigByType(question.data_type as DataType, question.config),
    question.topic_id,
    null
  );
};

export const createProposalObject = (proposal: ProposalRecord) => {
  return new Proposal(
    proposal.proposal_id,
    proposal.title || "",
    proposal.abstract || "",
    proposal.proposer_id,
    proposal.status,
    proposal.created_at,
    proposal.updated_at,
    proposal.short_code,
    proposal.rank_order,
    proposal.final_status
  );
};

export const createFieldDependencyObject = (
  fieldDependency: FieldDependencyRecord
) => {
  const conditionJson = JSON.parse(fieldDependency.condition);
  return new FieldDependency(
    fieldDependency.proposal_question_id,
    fieldDependency.proposal_question_dependency,
    new FieldCondition(
      conditionJson.condition.toUpperCase(),
      conditionJson.params
    )
  );
};

export const createQuestionaryFieldObject = (
  question: ProposalQuestionRecord & { value: any }
) => {
  return new QuestionaryField(
    createProposalTemplateFieldObject(question),
    question.value ? JSON.parse(question.value).value : ""
  );
};

export const createFileMetadata = (record: FileRecord) => {
  return new FileMetadata(
    record.file_id,
    record.oid,
    record.file_name,
    record.mime_type,
    record.size_in_bytes,
    record.created_at
  );
};

export const createUserObject = (user: UserRecord) => {
  return new User(
    user.user_id,
    user.user_title,
    user.firstname,
    user.middlename,
    user.lastname,
    user.username,
    user.preferredname,
    user.orcid,
    user.orcid_refreshtoken,
    user.gender,
    user.nationality,
    user.birthdate,
    user.organisation,
    user.department,
    user.position,
    user.email,
    user.email_verified,
    user.telephone,
    user.telephone_alt,
    user.placeholder,
    user.created_at.toISOString(),
    user.updated_at.toISOString()
  );
};

export const createBasicUserObject = (user: UserRecord) => {
  return new BasicUserDetails(
    user.user_id,
    user.preferredname,
    user.lastname,
    user.institution,
    user.position
  );
};
