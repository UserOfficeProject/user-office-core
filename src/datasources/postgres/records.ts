import { Page } from '../../models/Admin';
import { FileMetadata } from '../../models/Blob';
import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import {
  createConfigByType,
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  QuestionRel,
  Topic,
} from '../../models/ProposalModel';
import { BasicUserDetails, User } from '../../models/User';
import { ProposalTemplate } from './../../models/ProposalModel';

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
  readonly call_id: number;
  readonly template_id: number;
  readonly comment_for_user: string;
  readonly comment_for_management: string;
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
  readonly data_type: string;
  readonly question: string;
  readonly default_config: string;
  readonly sort_order: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly natural_key: string;
}

export interface ProposalQuestionProposalTemplateRelRecord {
  readonly id: number;
  readonly proposal_question_id: string;
  readonly template_id: string;
  readonly topic_id: number;
  readonly sort_order: number;
  readonly config: string;
  readonly dependency_proposal_question_id: string;
  readonly dependency_condition: string;
}

export interface ProposalTemplateRecord {
  readonly template_id: number;
  readonly name: string;
  readonly description: string;
  readonly is_archived: boolean;
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
  readonly public_comment: string;
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
  readonly template_id: number;
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

export interface EventLogRecord {
  readonly id: number;
  readonly changed_by: number;
  readonly event_type: string;
  readonly row_data: string;
  readonly event_tstamp: Date;
  readonly changed_object_id: string;
}

export interface SEPRecord {
  readonly sep_id: number;
  readonly code: string;
  readonly description: string;
  readonly number_ratings_required: number;
  readonly active: boolean;
  readonly full_count: number;
}

export interface SEPAssignmentRecord {
  readonly proposal_id: number;
  readonly sep_member_user_id: number;
  readonly sep_id: number;
  readonly date_assigned: Date;
  readonly reassigned: boolean;
  readonly date_reassigned: Date;
  readonly email_sent: boolean;
}

export interface SEPMemberRecord {
  readonly role_user_id: number;
  readonly role_id: number;
  readonly user_id: number;
  readonly sep_id: number;
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

export const createQuestionObject = (question: ProposalQuestionRecord) => {
  return new Question(
    question.proposal_question_id,
    question.natural_key,
    question.data_type as DataType,
    question.question,
    createConfigByType(question.data_type as DataType, question.default_config)
  );
};

export const createProposalTemplateObject = (
  template: ProposalTemplateRecord
) => {
  return new ProposalTemplate(
    template.template_id,
    template.name,
    template.description,
    template.is_archived
  );
};

export const createProposalObject = (proposal: ProposalRecord) => {
  return new Proposal(
    proposal.proposal_id,
    proposal.title || '',
    proposal.abstract || '',
    proposal.proposer_id,
    proposal.status,
    proposal.created_at,
    proposal.updated_at,
    proposal.short_code,
    proposal.rank_order,
    proposal.final_status,
    proposal.call_id,
    proposal.template_id,
    proposal.comment_for_user,
    proposal.comment_for_management
  );
};

export const createFieldDependencyObject = (
  fieldDependency: FieldDependencyRecord & { natural_key: string }
) => {
  const conditionJson = JSON.parse(fieldDependency.condition);

  return new FieldDependency(
    fieldDependency.proposal_question_id,
    fieldDependency.proposal_question_dependency,
    fieldDependency.natural_key,
    new FieldCondition(
      conditionJson.condition.toUpperCase(),
      conditionJson.params
    )
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

export const createQuestionRelObject = (
  record: ProposalQuestionRecord & ProposalQuestionProposalTemplateRelRecord
) => {
  return new QuestionRel(
    new Question(
      record.proposal_question_id,
      record.natural_key,
      record.data_type as DataType,
      record.question,
      createConfigByType(record.data_type as DataType, record.default_config)
    ),
    record.topic_id,
    record.sort_order,
    createConfigByType(record.data_type as DataType, record.config),
    record.dependency_proposal_question_id
      ? new FieldDependency(
          record.proposal_question_id,
          record.dependency_proposal_question_id,
          record.natural_key,
          FieldCondition.fromObject(record.dependency_condition) // TODO remove fromObject
        )
      : undefined
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
    user.position,
    user.created_at,
    user.placeholder
  );
};

export const createCallObject = (call: CallRecord) => {
  return new Call(
    call.call_id,
    call.call_short_code,
    call.start_call,
    call.end_call,
    call.start_review,
    call.end_review,
    call.start_notify,
    call.end_notify,
    call.cycle_comment,
    call.survey_comment,
    call.template_id
  );
};
