import { Page } from '../../models/Admin';
import { FileMetadata } from '../../models/Blob';
import { Call } from '../../models/Call';
import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { Proposal } from '../../models/Proposal';
import { createConfigByType } from '../../models/ProposalModelFunctions';
import { ProposalView } from '../../models/ProposalView';
import { Questionary, AnswerBasic } from '../../models/Questionary';
import { Sample } from '../../models/Sample';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  QuestionTemplateRelation,
  TemplateCategory,
  Topic,
} from '../../models/Template';
import { Template } from '../../models/Template';
import { BasicUserDetails, User } from '../../models/User';

// Interfaces corresponding exactly to database tables

export interface ProposalUserRecord {
  readonly proposal_id: number;
  readonly user_id: number;
}

export interface QuestionaryRecord {
  readonly questionary_id: number;
  readonly template_id: number;
  readonly creator_id: number;
  readonly created_at: Date;
}

export interface ProposalRecord {
  readonly proposal_id: number;
  readonly title: string;
  readonly abstract: string;
  readonly proposer_id: number;
  readonly status_id: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
  readonly short_code: string;
  readonly rank_order: number;
  readonly final_status: number;
  readonly excellence_score: number;
  readonly safety_score: number;
  readonly technical_score: number;
  readonly call_id: number;
  readonly questionary_id: number;
  readonly template_id: number;
  readonly comment_for_user: string;
  readonly comment_for_management: string;
  readonly notified: boolean;
  readonly submitted: boolean;
}

export interface ProposalViewRecord {
  readonly id: number;
  readonly title: string;
  readonly proposer_id: number;
  readonly proposal_status_id: number;
  readonly proposal_status_name: string;
  readonly proposal_status_description: string;
  readonly short_code: string;
  readonly rank_order: number;
  readonly final_status: number;
  readonly time_allocation: number;
  readonly notified: boolean;
  readonly status_id: number;
  readonly instrument_name: string;
  readonly call_short_code: string;
  readonly code: string;
  readonly average: number;
  readonly deviation: number;
  readonly instrument_id: number;
  readonly call_id: number;
  readonly submitted: boolean;
}

export interface TopicRecord {
  readonly topic_id: number;
  readonly topic_title: string;
  readonly is_enabled: boolean;
  readonly sort_order: number;
}

export interface FieldDependencyRecord {
  readonly question_id: string;
  readonly proposal_question_dependency: string;
  readonly condition: string;
}

export interface QuestionRecord {
  readonly category_id: number;
  readonly question_id: string;
  readonly data_type: string;
  readonly question: string;
  readonly default_config: string;
  readonly sort_order: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly natural_key: string;
}

export interface AnswerRecord {
  readonly answer_id: number;
  readonly questionary_id: number;
  readonly question_id: string;
  readonly answer: string;
  readonly created_at: Date;
}

interface DependencyCondition {
  condition: EvaluatorOperator;
  params: string | boolean | number;
}
export interface QuestionTemplateRelRecord {
  readonly id: number;
  readonly question_id: string;
  readonly template_id: string;
  readonly topic_id: number;
  readonly sort_order: number;
  readonly config: string;
  readonly dependency_question_id: string | null;
  readonly dependency_condition: DependencyCondition | null;
}

export interface TemplateRecord {
  readonly template_id: number;
  readonly category_id: number;
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
  readonly sep_id: number;
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
  readonly start_cycle: Date;
  readonly end_cycle: Date;
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

export interface SEPProposalRecord {
  readonly proposal_id: number;
  readonly sep_id: number;
  readonly date_assigned: Date;
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

export interface InstrumentRecord {
  readonly instrument_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly full_count: number;
}

export interface InstrumentWithAvailabilityTimeRecord {
  readonly instrument_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly availability_time: number;
  readonly submitted: boolean;
  readonly proposal_count: number;
  readonly full_count: number;
}

export interface TemplateCategoryRecord {
  readonly template_category_id: number;
  readonly name: string;
}

export interface SampleRecord {
  readonly sample_id: number;
  readonly title: string;
  readonly creator_id: number;
  readonly questionary_id: number;
  readonly safety_status: number;
  readonly safety_comment: string;
  readonly created_at: Date;
}

export interface ProposalStatusRecord {
  readonly proposal_status_id: number;
  readonly name: string;
  readonly description: string;
  readonly full_count: number;
}

export interface ProposalWorkflowRecord {
  readonly proposal_workflow_id: number;
  readonly name: string;
  readonly description: string;
  readonly full_count: number;
}

export interface ProposalWorkflowConnectionRecord {
  readonly proposal_workflow_connection_id: number;
  readonly sort_order: number;
  readonly proposal_workflow_id: number;
  readonly proposal_status_id: number;
  readonly next_proposal_status_id: number | null;
  readonly prev_proposal_status_id: number | null;
  readonly next_status_event_type: string;
  readonly droppable_group_id: string;
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

export const createQuestionObject = (question: QuestionRecord) => {
  return new Question(
    question.category_id,
    question.question_id,
    question.natural_key,
    question.data_type as DataType,
    question.question,
    createConfigByType(question.data_type as DataType, question.default_config)
  );
};

export const createProposalTemplateObject = (template: TemplateRecord) => {
  return new Template(
    template.template_id,
    template.category_id,
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
    proposal.status_id,
    proposal.created_at,
    proposal.updated_at,
    proposal.short_code,
    proposal.rank_order,
    proposal.final_status,
    proposal.call_id,
    proposal.questionary_id,
    proposal.comment_for_user,
    proposal.comment_for_management,
    proposal.notified,
    proposal.submitted
  );
};

export const createProposalViewObject = (proposal: ProposalViewRecord) => {
  return new ProposalView(
    proposal.id,
    proposal.title || '',
    proposal.proposal_status_id,
    proposal.proposal_status_name,
    proposal.proposal_status_description,
    proposal.short_code,
    proposal.rank_order,
    proposal.final_status,
    proposal.time_allocation,
    proposal.notified,
    proposal.status_id,
    proposal.instrument_name,
    proposal.call_short_code,
    proposal.code,
    proposal.average,
    proposal.deviation,
    proposal.instrument_id,
    proposal.call_id,
    proposal.submitted
  );
};

export const createFieldDependencyObject = (
  fieldDependency: FieldDependencyRecord & { natural_key: string }
) => {
  const conditionJson = JSON.parse(fieldDependency.condition);

  return new FieldDependency(
    fieldDependency.question_id,
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

export const createQuestionTemplateRelationObject = (
  record: QuestionRecord & QuestionTemplateRelRecord
) => {
  return new QuestionTemplateRelation(
    new Question(
      record.category_id,
      record.question_id,
      record.natural_key,
      record.data_type as DataType,
      record.question,
      createConfigByType(record.data_type as DataType, record.default_config)
    ),
    record.topic_id,
    record.sort_order,
    createConfigByType(record.data_type as DataType, record.config),
    record.dependency_question_id && record.dependency_condition
      ? new FieldDependency(
          record.question_id,
          record.dependency_question_id,
          record.natural_key,
          record.dependency_condition
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
    user.preferredname || user.firstname,
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
    call.start_cycle,
    call.end_cycle,
    call.cycle_comment,
    call.survey_comment,
    call.template_id
  );
};

export const createQuestionaryObject = (questionary: QuestionaryRecord) => {
  return new Questionary(
    questionary.questionary_id,
    questionary.template_id,
    questionary.creator_id,
    questionary.created_at
  );
};

export const createTemplateCategoryObject = (
  templateCategory: TemplateCategoryRecord
) => {
  return new TemplateCategory(
    templateCategory.template_category_id,
    templateCategory.name
  );
};

export const createSampleObject = (sample: SampleRecord) => {
  return new Sample(
    sample.sample_id,
    sample.title,
    sample.creator_id,
    sample.questionary_id,
    sample.safety_status,
    sample.safety_comment,
    sample.created_at
  );
};

export const createAnswerBasic = (answer: AnswerRecord) => {
  return new AnswerBasic(
    answer.answer_id,
    answer.questionary_id,
    answer.question_id,
    answer.answer,
    answer.created_at
  );
};
