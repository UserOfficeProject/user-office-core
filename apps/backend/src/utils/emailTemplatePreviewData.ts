import { AllocationTimeUnits, Call } from '../models/Call';
import { FapMeetingDecision } from '../models/FapMeetingDecision';
import { InstrumentWithManagementTime } from '../models/Instrument';
import { Proposal, ProposalEndStatus } from '../models/Proposal';
import { Answer } from '../models/Questionary';
import {
  TechnicalReview,
  TechnicalReviewStatus,
} from '../models/TechnicalReview';
import { Technique } from '../models/Technique';
import { DataType, Question, TemplateCategoryId } from '../models/Template';
import { BasicUserDetails } from '../models/User';
import { FieldConfigType } from '../resolvers/types/FieldConfig';

export type TemplateVariable = {
  key: string;
  value: string;
};

const SAFE_IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_VARIABLES = 200;
const MAX_VALUE_LENGTH = 2000;

function coerceSampleValue(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildSubstitutionData(
  variables: TemplateVariable[]
): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const { key, value } of variables.slice(0, MAX_VARIABLES)) {
    const segments = key.split('.');

    const isSafe = segments.every(
      (segment) => SAFE_IDENTIFIER.test(segment) && !FORBIDDEN_KEYS.has(segment)
    );

    if (!isSafe) {
      continue;
    }

    let node = root;
    let canAssign = true;

    for (const segment of segments.slice(0, -1)) {
      const child = node[segment];

      if (child === undefined || child === null) {
        node[segment] = {};
      } else if (!isPlainObject(child)) {
        canAssign = false;
        break;
      }

      node = node[segment] as Record<string, unknown>;
    }

    if (!canAssign) {
      continue;
    }

    const leaf = segments[segments.length - 1];
    const coerced = coerceSampleValue(value.slice(0, MAX_VALUE_LENGTH));

    try {
      node[leaf] = coerced;
    } catch {
      continue;
    }
  }

  return root;
}

const SAMPLE_USER = new BasicUserDetails(
  1,
  'Alex',
  'Example',
  'Alex',
  'Sample University',
  1,
  new Date('2026-01-01T00:00:00.000Z'),
  'alex@example.org',
  'United Kingdom',
  'Dr',
  null
);

const SAMPLE_INSTRUMENT = {
  id: 1,
  name: 'Sample instrument',
  shortCode: 'SAMPLE',
  description: 'Sample instrument for preview',
  managerUserId: 1,
  managementTimeAllocation: 1,
} satisfies InstrumentWithManagementTime;

const SAMPLE_QUESTION_CONFIG = {
  required: false,
  small_label: '',
  tooltip: '',
  readPermissions: [],
} as typeof FieldConfigType;

const SAMPLE_QUESTION = new Question(
  TemplateCategoryId.PROPOSAL_QUESTIONARY,
  'sample-question',
  'sample-question',
  DataType.TEXT_INPUT,
  'Sample question',
  SAMPLE_QUESTION_CONFIG
);

const SAMPLE_ANSWER = {
  answerId: 1,
  question: SAMPLE_QUESTION,
  topicId: 1,
  sortOrder: 1,
  templateId: 1,
  config: SAMPLE_QUESTION_CONFIG,
  dependencies: [],
  value: 'Sample answer',
} satisfies Answer;

const PROPOSAL_WORKFLOW_PREVIEW_DATA = {
  proposals: [
    {
      primaryKey: 1,
      title: 'Sample proposal',
      abstract: 'A sample proposal for preview.',
      proposerId: SAMPLE_USER.id,
      workflowStatusId: 1,
      created: new Date('2026-01-01T00:00:00.000Z'),
      updated: new Date('2026-01-01T00:00:00.000Z'),
      proposalId: '123456',
      finalStatus: ProposalEndStatus.ACCEPTED,
      callId: 1,
      questionaryId: 1,
      commentForUser: 'Sample comment for the proposer.',
      commentForManagement: '',
      notified: true,
      submitted: true,
      referenceNumberSequence: 1,
      managementDecisionSubmitted: true,
      submittedDate: new Date('2026-01-01T00:00:00.000Z'),
      experimentSequence: null,
      fileId: null,
    } satisfies Proposal,
  ],
  pi: SAMPLE_USER,
  coProposers: [
    new BasicUserDetails(
      2,
      'Sam',
      'Colleague',
      'Sam',
      'Sample University',
      1,
      new Date('2026-01-01T00:00:00.000Z'),
      'sam@example.org',
      'United Kingdom',
      'Dr',
      null
    ),
  ],
  instruments: [SAMPLE_INSTRUMENT],
  firstName: 'Alex',
  lastName: 'Example',
  preferredName: 'Alex',
  techniques: [
    {
      id: 1,
      name: 'Sample technique',
      shortCode: 'TECH',
      description: 'Sample technique for preview',
    } satisfies Technique,
  ],
  proposalTemplate: 'Sample proposal template',
  samples: [SAMPLE_ANSWER],
  hazards: [
    {
      ...SAMPLE_ANSWER,
      answerId: 2,
      question: new Question(
        TemplateCategoryId.PROPOSAL_QUESTIONARY,
        'sample-hazard',
        'sample-hazard',
        DataType.TEXT_INPUT,
        'Sample hazard question',
        SAMPLE_QUESTION_CONFIG
      ),
      value: 'No known hazards',
    } satisfies Answer,
  ],
  rejectionComment: 'Sample rejection comment',
  fapMeetingDecisions: [
    {
      proposalPk: 1,
      meetingScore: '1',
      recommendation: ProposalEndStatus.ACCEPTED,
      commentForUser: 'Sample panel comment.',
      commentForManagement: '',
      submitted: true,
      submittedBy: 1,
      recommendedInstrumentId: 1,
      fapId: 1,
      recommendedTimeAllocation: 0,
      fapProposalId: 1,
    } satisfies FapMeetingDecision,
  ],
  technicalReviews: [
    {
      id: 1,
      proposalPk: 1,
      comment: 'Sample internal technical review.',
      publicComment: 'Sample technical review comment.',
      timeAllocation: 1,
      status: TechnicalReviewStatus.FEASIBLE,
      submitted: true,
      reviewerId: 1,
      files: null,
      technicalReviewAssigneeId: 1,
      instrumentId: SAMPLE_INSTRUMENT.id,
      questionaryId: 1,
    } satisfies TechnicalReview,
  ],
  call: {
    id: 1,
    shortCode: 'SAMPLE',
    startCall: new Date('2026-01-01T00:00:00.000Z'),
    endCall: new Date('2026-12-31T23:59:59.000Z'),
    endCallInternal: new Date('2026-12-31T23:59:59.000Z'),
    startReview: new Date('2026-01-01T00:00:00.000Z'),
    endReview: new Date('2026-12-31T23:59:59.000Z'),
    startFapReview: new Date('2026-01-01T00:00:00.000Z'),
    endFapReview: new Date('2026-12-31T23:59:59.000Z'),
    startNotify: new Date('2026-01-01T00:00:00.000Z'),
    endNotify: new Date('2026-12-31T23:59:59.000Z'),
    startCycle: new Date('2026-01-01T00:00:00.000Z'),
    endCycle: new Date('2026-12-31T23:59:59.000Z'),
    cycleComment: '',
    submissionMessage: '',
    referenceNumberFormat: '123456',
    proposalSequence: 1,
    proposalWorkflowId: 1,
    callEnded: false,
    callEndedInternal: false,
    callReviewEnded: false,
    callFapReviewEnded: false,
    templateId: 1,
    esiTemplateId: undefined,
    allocationTimeUnit: AllocationTimeUnits.Shift,
    title: 'Sample call',
    description: 'Sample call for preview',
    proposalPdfTemplateId: undefined,
    experimentSafetyPdfTemplateId: undefined,
    fapReviewTemplateId: 1,
    technicalReviewTemplateId: 1,
    isActive: true,
    sort_order: 1,
    experimentWorkflowId: 1,
  } satisfies Call,
};

function isPlaceholder(value: unknown, path: string): boolean {
  if (value === path) {
    return true;
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);

  return (
    entries.length > 0 &&
    entries.every(([key, child]) => isPlaceholder(child, `${path}.${key}`))
  );
}

export function buildEmailTemplatePreviewData(
  variables: TemplateVariable[]
): Record<string, unknown> {
  const data = buildSubstitutionData(variables);

  for (const [key, sample] of Object.entries(PROPOSAL_WORKFLOW_PREVIEW_DATA)) {
    if (isPlaceholder(data[key], key)) {
      data[key] = sample;
    }
  }

  return data;
}
