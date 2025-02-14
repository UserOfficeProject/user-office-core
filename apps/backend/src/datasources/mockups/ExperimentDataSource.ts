import { Experiment, ExperimentSafety } from '../../models/Experiment';
import { Rejection } from '../../models/Rejection';
import { ExperimentDataSource } from '../ExperimentDataSource';

export class ExperimentDataSourceMock implements ExperimentDataSource {
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
    experimentPk: number
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
}
