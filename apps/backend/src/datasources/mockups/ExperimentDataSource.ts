import {
  Experiment,
  ExperimentHasSample,
  ExperimentSafety,
} from '../../models/Experiment';
import { Rejection } from '../../models/Rejection';
import { UpdateExperimentSafetyArgs } from '../../resolvers/mutations/UpdateExperimentSafetyMutation';
import { ExperimentDataSource } from '../ExperimentDataSource';

export class ExperimentDataSourceMock implements ExperimentDataSource {
  getExperimentSamples(experimentPk: number): Promise<ExperimentHasSample[]> {
    throw new Error('Method not implemented.');
  }
  updateExperimentSample(
    experimentPk: number,
    sampleId: number,
    isSubmitted: boolean
  ): Promise<ExperimentHasSample> {
    throw new Error('Method not implemented.');
  }
  getExperimentSample(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample | null> {
    throw new Error('Method not implemented.');
  }
  getExperimentSafetyByESIQuestionaryId(
    esiQuestionaryId: number
  ): Promise<ExperimentSafety | null> {
    throw new Error('Method not implemented.');
  }
  getExperimentSafety(experimentPk: number): Promise<ExperimentSafety | null> {
    throw new Error('Method not implemented.');
  }
  updateExperimentSafety(
    args: UpdateExperimentSafetyArgs
  ): Promise<ExperimentSafety> {
    throw new Error('Method not implemented.');
  }
  createExperimentSafety(
    experimentPk: number,
    questionaryId: number,
    creatorId: number
  ): Promise<ExperimentSafety | Rejection> {
    throw new Error('Method not implemented.');
  }
  getExperimentSafetyByExperimentPk(
    experimentSafetyPk: number
  ): Promise<ExperimentSafety | null> {
    throw new Error('Method not implemented.');
  }
  create(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    throw new Error('Method not implemented.');
  }

  updateByScheduledEventId(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    throw new Error('Method not implemented.');
  }

  deleteByScheduledEventId(experimentId: number): Promise<Experiment> {
    throw new Error('Method not implemented.');
  }

  getUserUpcomingExperiments(userId: number): Promise<Experiment[]> {
    throw new Error('Method not implemented.');
  }

  getExperiment(experimentPk: number): Promise<Experiment | null> {
    throw new Error('Method not implemented.');
  }
  addSampleToExperiment(
    experimentPk: number,
    sampleId: number,
    sampleEsiQuestionaryId: number
  ): Promise<ExperimentHasSample> {
    throw new Error('Method not implemented.');
  }
  removeSampleFromExperiment(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample> {
    throw new Error('Method not implemented.');
  }
}
