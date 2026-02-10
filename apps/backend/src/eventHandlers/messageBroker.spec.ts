import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSourceMock } from '../datasources/mockups/CallDataSource';
import MockDataAccessUsersDataSource from '../datasources/mockups/DataAccessUsersDataSource';
import {
  ExperimentDataSourceMock,
  OngoingExperiment,
  UpcomingExperimentWithExperiment,
} from '../datasources/mockups/ExperimentDataSource';
import {
  dummyInstrument,
  InstrumentDataSourceMock,
} from '../datasources/mockups/InstrumentDataSource';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { StatusDataSourceMock } from '../datasources/mockups/StatusDataSource';
import {
  dummyUser,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { getExperimentMessageData } from './messageBroker';

describe('messageBroker', () => {
  describe('getExperimentMessageData', () => {
    let mockExperimentDataSource: ExperimentDataSourceMock;
    let mockSampleDataSource: SampleDataSourceMock;
    let mockProposalDataSource: ProposalDataSourceMock;
    let mockInstrumentDataSource: InstrumentDataSourceMock;
    let mockUserDataSource: UserDataSourceMock;
    let mockDataAccessUsersDataSource: MockDataAccessUsersDataSource;
    let mockStatusDataSource: StatusDataSourceMock;
    let mockCallDataSource: CallDataSourceMock;

    beforeEach(() => {
      mockExperimentDataSource = container.resolve(Tokens.ExperimentDataSource);
      mockSampleDataSource = container.resolve(Tokens.SampleDataSource);
      mockProposalDataSource = container.resolve(Tokens.ProposalDataSource);
      mockInstrumentDataSource = container.resolve(Tokens.InstrumentDataSource);
      mockUserDataSource = container.resolve(Tokens.UserDataSource);
      mockDataAccessUsersDataSource = container.resolve(
        Tokens.DataAccessUsersDataSource
      );
      mockStatusDataSource = container.resolve(Tokens.StatusDataSource);
      mockCallDataSource = container.resolve(Tokens.CallDataSource);

      mockExperimentDataSource.init();
      mockSampleDataSource.init();
      mockProposalDataSource.init();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should include instrument data when instrument exists', async () => {
      const mockExperiment = {
        ...OngoingExperiment,
        instrumentId: dummyInstrument.id,
        proposalPk: dummyProposal.primaryKey,
      } as any;

      const result = await getExperimentMessageData(mockExperiment);
      const data = JSON.parse(result);

      expect(data.instrument).toEqual({
        id: dummyInstrument.id,
        name: dummyInstrument.name,
        shortCode: dummyInstrument.shortCode,
      });
      expect(data.experimentId).toBe(OngoingExperiment.experimentId);
      expect(data.proposal.proposalPk).toBe(dummyProposal.primaryKey);
    });

    it('should have instrument as undefined when instrument does not exist', async () => {
      const mockExperiment = {
        ...OngoingExperiment,
        instrumentId: 999,
        proposalPk: dummyProposal.primaryKey,
      } as any;

      const result = await getExperimentMessageData(mockExperiment);
      const data = JSON.parse(result);

      expect(data.instrument).toBeUndefined();
    });

    it('should include samples data', async () => {
      const mockExperiment = {
        ...UpcomingExperimentWithExperiment,
        instrumentId: dummyInstrument.id,
        proposalPk: dummyProposal.primaryKey,
      } as any;

      const result = await getExperimentMessageData(mockExperiment);
      const data = JSON.parse(result);

      expect(data.samples).toHaveLength(1);
      expect(data.samples[0]).toEqual({
        id: mockSampleDataSource.samples[0].id,
        title: mockSampleDataSource.samples[0].title,
      });
    });

    it('should include proposer data', async () => {
      const mockExperiment = {
        ...OngoingExperiment,
        proposalPk: dummyProposal.primaryKey,
      } as any;

      const result = await getExperimentMessageData(mockExperiment);
      const data = JSON.parse(result);

      expect(data.proposal.proposer).toBeDefined();
      expect(data.proposal.proposer.id).toBe(dummyUser.id.toString());
      expect(data.proposal.proposer.firstName).toBe(dummyUser.firstname);
    });
  });
});
