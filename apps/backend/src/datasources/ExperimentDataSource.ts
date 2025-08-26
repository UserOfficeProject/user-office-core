import { Event } from '../events/event.enum';
import {
  Experiment,
  ExperimentHasSample,
  ExperimentSafety,
  InstrumentScientistDecisionEnum,
  ExperimentSafetyReviewerDecisionEnum,
} from '../models/Experiment';
import { Rejection } from '../models/Rejection';
import { User } from '../models/User';
import {
  ExperimentsFilter,
  UserExperimentsFilter,
} from '../resolvers/queries/ExperimentsQuery';
import { ExperimentSafetyEventsRecord } from './postgres/records';

export interface ExperimentDataSource {
  create(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment>;
  updateByScheduledEventId(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment>;
  deleteByScheduledEventId(experimentId: number): Promise<Experiment>;
  getUserExperiments(
    userId: User['id'],
    args: UserExperimentsFilter
  ): Promise<Experiment[]>;
  getExperiment(experimentPk: number): Promise<Experiment | null>;
  getExperimentSafetyByExperimentPk(
    experimentPk: number
  ): Promise<ExperimentSafety | null>;
  getExperimentSafety(
    experimentSafetyPk: number
  ): Promise<ExperimentSafety | null>;
  updateExperimentSafety(
    experimentSafetyPk: number,
    updateFields: Partial<{
      safetyReviewQuestionaryId: number;
      esiQuestionarySubmittedAt: Date | null;
      instrumentScientistDecision: InstrumentScientistDecisionEnum | null;
      instrumentScientistComment: string | null;
      experimentSafetyReviewerDecision: ExperimentSafetyReviewerDecisionEnum | null;
      experimentSafetyReviewerComment: string | null;
      reviewedBy: number;
    }>
  ): Promise<ExperimentSafety>;
  updateExperimentSafetyStatus(
    experimentSafetyPk: number,
    statusId: number
  ): Promise<ExperimentSafety>;
  createExperimentSafety(
    experimentPk: number,
    questionaryId: number,
    creatorId: number,
    statusId: number
  ): Promise<ExperimentSafety | Rejection>;
  getExperimentSafetyByESIQuestionaryId(
    esiQuestionaryId: number
  ): Promise<ExperimentSafety | null>;
  addSampleToExperiment(
    experimentPk: number,
    sampleId: number,
    sampleEsiQuestionaryId: number
  ): Promise<ExperimentHasSample>;
  removeSampleFromExperiment(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample>;
  getExperimentSample(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample | null>;
  getExperimentSamples(experimentPk: number): Promise<ExperimentHasSample[]>;
  updateExperimentSample(
    experimentPk: number,
    sampleId: number,
    isSubmitted: boolean
  ): Promise<ExperimentHasSample>;
  getAllExperiments(
    filter?: ExperimentsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string,
    instrumentScientistUserId?: number
  ): Promise<{
    totalCount: number;
    experiments: Experiment[];
  }>;
  getExperimentsByProposalPk(proposalPk: number): Promise<Experiment[]>;
  markEventAsDoneOnExperimentSafeties(
    event: Event,
    experimentPks: number[]
  ): Promise<ExperimentSafetyEventsRecord[] | null>;
  getExperimentSafetyEvents(
    experimentPk: number
  ): Promise<ExperimentSafetyEventsRecord | null>;
}
