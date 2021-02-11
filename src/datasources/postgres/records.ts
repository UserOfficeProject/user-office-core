import { Page } from '../../models/Admin';
import { FileMetadata } from '../../models/Blob';
import { Call } from '../../models/Call';
import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '../../models/ConditionEvaluator';
import { Feature, FeatureId } from '../../models/Feature';
import { Proposal } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { AnswerBasic, Questionary } from '../../models/Questionary';
import { createConfig } from '../../models/questionTypes/QuestionRegistry';
import { Sample } from '../../models/Sample';
import { Shipment, ShipmentStatus } from '../../models/Shipment';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  QuestionTemplateRelation,
  Template,
  TemplateCategory,
  Topic,
} from '../../models/Template';
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
  readonly technical_review_status: number;
  readonly instrument_name: string;
  readonly call_short_code: string;
  readonly sep_code: string;
  readonly average: number;
  readonly deviation: number;
  readonly instrument_id: number;
  readonly call_id: number;
  readonly submitted: boolean;
}

export interface TopicRecord {
  readonly topic_id: number;
  readonly topic_title: string;
  readonly template_id: number;
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

export interface Dependency {
  condition: DependencyCondition;
  dependencyId: string;
}

export interface DependencyCondition {
  condition: EvaluatorOperator;
  params: string | boolean | number;
}

export interface QuestionDependencyRecord {
  readonly question_dependency_id: number;
  readonly question_id: string;
  readonly template_id: number;
  readonly dependency_question_id: string;
  readonly dependency_condition: DependencyCondition;
}

export interface QuestionTemplateRelRecord {
  readonly id: number;
  readonly question_id: string;
  readonly template_id: number;
  readonly topic_id: number;
  readonly sort_order: number;
  readonly config: string;
  readonly dependencies_operator?: DependenciesLogicOperator;
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
  readonly start_sep_review: Date;
  readonly end_sep_review: Date;
  readonly start_notify: Date;
  readonly end_notify: Date;
  readonly start_cycle: Date;
  readonly end_cycle: Date;
  readonly cycle_comment: string;
  readonly survey_comment: string;
  readonly proposal_workflow_id: number;
  readonly call_ended: boolean;
  readonly call_review_ended: boolean;
  readonly call_sep_review_ended: boolean;
  readonly template_id: number;
}

export interface PageTextRecord {
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
  readonly sep_time_allocation: number | null;
  readonly instrument_submitted?: boolean;
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

export interface RoleUserRecord {
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

export interface InstrumentHasProposalsRecord {
  readonly instrument_id: number;
  readonly proposal_id: number;
  readonly submitted: boolean;
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
  readonly proposal_id: number;
  readonly questionary_id: number;
  readonly question_id: string;
  readonly safety_status: number;
  readonly safety_comment: string;
  readonly created_at: Date;
}

export interface ShipmentRecord {
  readonly shipment_id: number;
  readonly title: string;
  readonly creator_id: number;
  readonly proposal_id: number;
  readonly questionary_id: number;
  readonly status: string;
  readonly external_ref: string;
  readonly created_at: Date;
}

export interface ProposalStatusRecord {
  readonly proposal_status_id: number;
  readonly short_code: string;
  readonly name: string;
  readonly description: string;
  readonly is_default: boolean;
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
  readonly droppable_group_id: string;
  readonly parent_droppable_group_id: string;
}

export interface NextStatusEventRecord {
  readonly next_status_event_id: number;
  readonly proposal_workflow_connection_id: number;
  readonly next_status_event: string;
}

export interface ProposalEventsRecord {
  readonly proposal_id: number;
  readonly proposal_created: boolean;
  readonly proposal_submitted: boolean;
  readonly proposal_feasible: boolean;
  readonly call_ended: boolean;
  readonly call_review_ended: boolean;
  readonly proposal_sep_selected: boolean;
  readonly proposal_instrument_selected: boolean;
  readonly proposal_feasibility_review_submitted: boolean;
  readonly proposal_sample_review_submitted: boolean;
  readonly proposal_all_sep_reviewers_selected: boolean;
  readonly proposal_sep_review_submitted: boolean;
  readonly proposal_sep_meeting_submitted: boolean;
  readonly proposal_instrument_submitted: boolean;
  readonly proposal_accepted: boolean;
  readonly proposal_rejected: boolean;
  readonly proposal_notified: boolean;
}

export interface FeatureRecord {
  readonly feature_id: string;
  readonly is_enabled: boolean;
  readonly description: string;
}

export const createPageObject = (record: PageTextRecord) => {
  return new Page(record.pagetext_id, record.content);
};

export interface TokensAndPermissionsRecord {
  readonly access_token_id: string;
  readonly name: string;
  readonly access_token: string;
  readonly access_permissions: string;
}

export const createTopicObject = (record: TopicRecord) => {
  return new Topic(
    record.topic_id,
    record.topic_title,
    record.template_id,
    record.sort_order,
    record.is_enabled
  );
};

export const createQuestionObject = (question: QuestionRecord) => {
  return new Question(
    question.category_id,
    question.question_id,
    question.natural_key,
    question.data_type as DataType,
    question.question,
    createConfig<any>(question.data_type as DataType, question.default_config)
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
    proposal.technical_review_status,
    proposal.instrument_name,
    proposal.call_short_code,
    proposal.sep_code,
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
  record: QuestionRecord &
    QuestionTemplateRelRecord & { dependency_natural_key: string },
  dependencies: FieldDependency[]
) => {
  return new QuestionTemplateRelation(
    new Question(
      record.category_id,
      record.question_id,
      record.natural_key,
      record.data_type as DataType,
      record.question,
      createConfig<any>(record.data_type as DataType, record.default_config)
    ),
    record.topic_id,
    record.sort_order,
    createConfig<any>(record.data_type as DataType, record.config),
    dependencies,
    record.dependencies_operator
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
    call.start_sep_review,
    call.end_sep_review,
    call.start_notify,
    call.end_notify,
    call.start_cycle,
    call.end_cycle,
    call.cycle_comment,
    call.survey_comment,
    call.proposal_workflow_id,
    call.call_ended,
    call.call_review_ended,
    call.call_sep_review_ended,
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
    sample.proposal_id,
    sample.questionary_id,
    sample.question_id,
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

export const createShipmentObject = (shipment: ShipmentRecord) => {
  return new Shipment(
    shipment.shipment_id,
    shipment.title,
    shipment.creator_id,
    shipment.proposal_id,
    shipment.questionary_id,
    shipment.status as ShipmentStatus,
    shipment.external_ref,
    shipment.created_at
  );
};

export const createFeatureObject = (record: FeatureRecord) => {
  return new Feature(
    record.feature_id as FeatureId,
    record.is_enabled,
    record.description
  );
};
