import {
  Experiment,
  ExperimentHasSample,
  ExperimentSafety,
} from '../models/Experiment';
import { Rejection } from '../models/Rejection';
import { User } from '../models/User';
import { SubmitExperimentSafetyArgs } from '../resolvers/mutations/UpdateExperimentSafetyMutation';
import {
  ExperimentsArgs,
  UserExperimentsFilter,
} from '../resolvers/queries/ExperimentsQuery';

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
  createExperimentSafety(
    experimentPk: number,
    questionaryId: number,
    creatorId: number
  ): Promise<ExperimentSafety | Rejection>;
  submitExperimentSafety(
    args: SubmitExperimentSafetyArgs
  ): Promise<ExperimentSafety>;
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
  getExperiments({ filter }: ExperimentsArgs): Promise<Experiment[]>;
  getExperimentsByProposalPk(proposalPk: number): Promise<Experiment[]>;
}
