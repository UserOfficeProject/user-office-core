import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  DummyExperimentSample1,
  ExperimentDataSourceMock,
  UpcomingExperimentWithExperiment,
} from '../datasources/mockups/ExperimentDataSource';
import { ExperimentSafety } from '../models/Experiment';
import ExperimentQueries from './ExperimentQueries';

describe('ExperimentQueries', () => {
  let queries: ExperimentQueries;
  let dataSource: ExperimentDataSourceMock;

  beforeEach(() => {
    dataSource = container.resolve<ExperimentDataSourceMock>(
      Tokens.ExperimentDataSource
    );
    dataSource.init();
    queries = container.resolve(ExperimentQueries);
    queries.dataSource = dataSource;
  });

  describe('getExperimentSafetyByExperimentPk', () => {
    test('returns experiment safety when exists', async () => {
      const createdSafety = await dataSource.createExperimentSafety(
        UpcomingExperimentWithExperiment.experimentPk,
        10,
        1
      );
      const result = await queries.getExperimentSafetyByExperimentPk(
        null,
        UpcomingExperimentWithExperiment.experimentPk
      );
      expect(result).toEqual(createdSafety);
    });

    test('returns null when safety does not exist', async () => {
      const result = await queries.getExperimentSafetyByExperimentPk(null, 999);
      expect(result).toBeNull();
    });
  });

  describe('getExperimentSafety', () => {
    test('returns experiment safety by safety pk when exists', async () => {
      const createdSafety = (await dataSource.createExperimentSafety(
        UpcomingExperimentWithExperiment.experimentPk,
        20,
        2
      )) as ExperimentSafety;
      const result = await queries.getExperimentSafety(
        null,
        createdSafety.experimentSafetyPk
      );
      expect(result).toEqual(createdSafety);
    });

    test('returns null when safety pk does not exist', async () => {
      const result = await queries.getExperimentSafety(null, 999);
      expect(result).toBeNull();
    });
  });

  describe('getExperimentSample', () => {
    test('returns experiment sample when available', async () => {
      // Override the method to return a dummy sample
      const result = await queries.getExperimentSample(null, {
        experimentPk: 1,
        sampleId: 1,
      });
      expect(result).toEqual(DummyExperimentSample1);
    });

    test('returns null when sample is not found', async () => {
      dataSource.getExperimentSample = () => Promise.resolve(null);
      const result = await queries.getExperimentSample(null, {
        experimentPk: 1,
        sampleId: 999,
      });
      expect(result).toBeNull();
    });
  });

  describe('getExperimentSamples', () => {
    test('returns an array of experiment samples', async () => {
      const dummySamples = [DummyExperimentSample1];
      const result = await queries.getExperimentSamples(null, 1);
      expect(result).toEqual(dummySamples);
    });
  });

  describe('getExperiments', () => {
    test('returns an array of experiments', async () => {
      // Use the experiments generated in init()
      const dummyExperiments = (dataSource as any).experiments;
      dataSource.getAllExperiments = () => Promise.resolve(dummyExperiments);
      const result = await queries.getAllExperiments(null, {});
      expect(result).toEqual(dummyExperiments);
    });
  });

  describe('getExperiment', () => {
    test('returns an experiment when found', async () => {
      const experimentPk = UpcomingExperimentWithExperiment.experimentPk;
      const expected = (dataSource as any).experiments.find(
        (exp: any) => exp.experimentPk === experimentPk
      );
      const result = await queries.getExperiment(null, experimentPk);
      expect(result).toEqual(expected);
    });

    test('returns null when experiment not found', async () => {
      const result = await queries.getExperiment(null, 999);
      expect(result).toBeNull();
    });
  });
});
