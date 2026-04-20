import 'reflect-metadata';
import { container } from 'tsyringe';

import { getExperimentMessageData } from './messageBroker';
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
  dummyInstrumentWithManagementTime,
  InstrumentDataSourceMock,
} from '../datasources/mockups/InstrumentDataSource';
import {
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { StatusDataSourceMock } from '../datasources/mockups/StatusDataSource';
import {
  dummyCountry,
  dummyInstitution,
  dummyUser,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import {
  getExperimentMessageData,
  getProposalMessageData,
} from './messageBroker';

describe('messageBroker', () => {
  describe('getProposalMessageData', () => {
    let mockUserDataSource: UserDataSourceMock;
    let mockProposalDataSource: ProposalDataSourceMock;
    let mockInstrumentDataSource: InstrumentDataSourceMock;
    let mockSampleDataSource: SampleDataSourceMock;
    let mockStatusDataSource: StatusDataSourceMock;
    let mockCallDataSource: CallDataSourceMock;

    beforeEach(() => {
      mockUserDataSource = container.resolve(Tokens.UserDataSource);
      mockProposalDataSource = container.resolve(Tokens.ProposalDataSource);
      mockInstrumentDataSource = container.resolve(Tokens.InstrumentDataSource);
      mockSampleDataSource = container.resolve(Tokens.SampleDataSource);
      mockStatusDataSource = container.resolve(Tokens.StatusDataSource);
      mockCallDataSource = container.resolve(Tokens.CallDataSource);

      mockProposalDataSource.init();
      mockSampleDataSource.init();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should include basic proposal fields', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(data.proposalPk).toBe(dummyProposal.primaryKey);
      expect(data.shortCode).toBe(dummyProposal.proposalId);
      expect(data.title).toBe(dummyProposal.title);
      expect(data.abstract).toBe(dummyProposal.abstract);
      expect(data.submitted).toBe(dummyProposal.submitted);
    });

    it('should include proposer with institution and country', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(data.proposer.id).toBe(dummyUser.id.toString());
      expect(data.proposer.firstName).toBe(dummyUser.firstname);
      expect(data.proposer.lastName).toBe(dummyUser.lastname);
      expect(data.proposer.institution.name).toBe(dummyInstitution.name);
      expect(data.proposer.country.country).toBe(dummyCountry.country);
    });

    it('should include members with institution and country', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(data.members).toHaveLength(1);
      expect(data.members[0].id).toBe(dummyUser.id.toString());
      expect(data.members[0].institution.name).toBe(dummyInstitution.name);
      expect(data.members[0].country.country).toBe(dummyCountry.country);
    });

    it('should include dataAccessUsers with institution and country', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(Array.isArray(data.dataAccessUsers)).toBe(true);
    });

    it('should include instruments when assigned to proposal', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(data.instruments).toBeDefined();
      expect(data.instruments[0].id).toBe(dummyInstrumentWithManagementTime.id);
      expect(data.instruments[0].shortCode).toBe(
        dummyInstrumentWithManagementTime.shortCode
      );
    });

    it('should include samples', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(data.samples).toHaveLength(1);
      expect(data.samples[0].id).toBe(mockSampleDataSource.samples[0].id);
      expect(data.samples[0].title).toBe(mockSampleDataSource.samples[0].title);
    });

    it('should include newStatus', async () => {
      const result = await getProposalMessageData(dummyProposal);
      const data = JSON.parse(result);

      expect(data.newStatus).toBeDefined();
    });
  });

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
