import {
  Topic,
  ProposalTemplateField,
  DataType,
  FieldDependency,
  FieldCondition,
  QuestionaryField
} from "../../models/ProposalModel";
import { Proposal } from "../../models/Proposal";

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
  readonly short_code: string;
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
  readonly nationality: string;
  readonly birthdate: string;
  readonly organisation: string;
  readonly department: string;
  readonly organisation_address: string;
  readonly position: string;
  readonly email: string;
  readonly email_verified: boolean;
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
    question.data_type as DataType,
    question.sort_order,
    question.question,
    question.config,
    question.topic_id,
    null
  );
};

export const createProposalObject = (proposal: ProposalRecord) => {
  return new Proposal(
    proposal.proposal_id,
    proposal.title,
    proposal.abstract,
    proposal.proposer_id,
    proposal.status,
    proposal.created_at,
    proposal.updated_at
  );
};

export const createFieldDependencyObject = (
  fieldDependency: FieldDependencyRecord
) => {
  if (!fieldDependency) {
    return null;
  }
  const conditionJson = JSON.parse(fieldDependency.condition);
  return new FieldDependency(
    fieldDependency.proposal_question_id,
    fieldDependency.proposal_question_dependency,
    JSON.stringify(
      new FieldCondition(conditionJson.condition, conditionJson.params)
    ) // TODO SWAP-341. Remove stringifying
  );
};

export const createQuestionaryFieldObject = (
  question: ProposalQuestionRecord & { value: any }
) => {
  return new QuestionaryField(
    new ProposalTemplateField(
      question.proposal_question_id,
      question.data_type as DataType,
      question.sort_order,
      question.question,
      question.config,
      question.topic_id,
      null
    ),
    question.value || ""
  );
};
