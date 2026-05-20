import 'reflect-metadata';
import { container } from 'tsyringe';

import ExperimentQueries from './ExperimentQueries';
import { Tokens } from '../config/Tokens';
import {
  DummyExperimentSample1,
  ExperimentDataSourceMock,
  UpcomingExperimentWithExperiment,
} from '../datasources/mockups/ExperimentDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import { ExperimentSafety } from '../models/Experiment';

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
        dummyUserOfficerWithRole,
        UpcomingExperimentWithExperiment.experimentPk
      );
      expect(result).toEqual(createdSafety);
    });

    test('returns null when safety does not exist', async () => {
      const result = await queries.getExperimentSafetyByExperimentPk(
        dummyUserOfficerWithRole,
        999
      );
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
        dummyUserOfficerWithRole,
        createdSafety.experimentSafetyPk
      );
      expect(result).toEqual(createdSafety);
    });

    test('returns null when safety pk does not exist', async () => {
      const result = await queries.getExperimentSafety(
        dummyUserOfficerWithRole,
        999
      );
      expect(result).toBeNull();
    });
  });

  describe('getExperimentSample', () => {
    test('returns experiment sample when available', async () => {
      // Override the method to return a dummy sample
      const result = await queries.getExperimentSample(
        dummyUserOfficerWithRole,
        {
          experimentPk: 1,
          sampleId: 1,
        }
      );
      expect(result).toEqual(DummyExperimentSample1);
    });

    test('returns null when sample is not found', async () => {
      dataSource.getExperimentSample = () => Promise.resolve(null);
      const result = await queries.getExperimentSample(
        dummyUserOfficerWithRole,
        {
          experimentPk: 1,
          sampleId: 999,
        }
      );
      expect(result).toBeNull();
    });
  });

  describe('getExperimentSamples', () => {
    test('returns an array of experiment samples', async () => {
      const dummySamples = [DummyExperimentSample1];
      const result = await queries.getExperimentSamples(
        dummyUserOfficerWithRole,
        1
      );
      expect(result).toEqual(dummySamples);
    });
  });

  describe('getExperiments', () => {
    test('returns an array of experiments', async () => {
      // Use the experiments generated in init()
      const dummyExperiments = (dataSource as any).experiments;
      dataSource.getExperiments = () => Promise.resolve(dummyExperiments);
      const result = await queries.getExperiments(dummyUserOfficerWithRole, {});
      expect(result).toEqual(dummyExperiments);
    });
  });

  describe('getExperiment', () => {
    test('returns an experiment when found', async () => {
      const experimentPk = UpcomingExperimentWithExperiment.experimentPk;
      const expected = (dataSource as any).experiments.find(
        (exp: any) => exp.experimentPk === experimentPk
      );
      const result = await queries.getExperiment(
        dummyUserOfficerWithRole,
        experimentPk
      );
      expect(result).toEqual(expected);
    });

    test('returns null when experiment not found', async () => {
      const result = await queries.getExperiment(dummyUserOfficerWithRole, 999);
      expect(result).toBeNull();
    });
  });
});
