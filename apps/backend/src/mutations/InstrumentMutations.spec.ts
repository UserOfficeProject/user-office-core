import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyInstrument,
  dummyInstrumentHasProposals,
} from '../datasources/mockups/InstrumentDataSource';
import { ProposalSettingsDataSourceMock } from '../datasources/mockups/ProposalSettingsDataSource';
import { StatusDataSourceMock } from '../datasources/mockups/StatusDataSource';
import { TechniqueDataSourceMock } from '../datasources/mockups/TechniqueDataSource';
import {
  dummyInstrumentScientist,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import InstrumentMutations from './InstrumentMutations';

let proposalSettingsDataSource: ProposalSettingsDataSourceMock;
let statusDataSource: StatusDataSourceMock;
let techniqueDataSource: TechniqueDataSourceMock;

const instrumentMutations = container.resolve(InstrumentMutations);

beforeEach(() => {
  proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSourceMock>(
      Tokens.ProposalSettingsDataSource
    );
  statusDataSource = container.resolve<StatusDataSourceMock>(
    Tokens.StatusDataSource
  );
  techniqueDataSource = container.resolve<TechniqueDataSourceMock>(
    Tokens.TechniqueDataSource
  );
});

describe('Test Instrument Mutations', () => {
  test('A user can not create an instrument', () => {
    return expect(
      instrumentMutations.create(dummyUserWithRole, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
        managerUserId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A not logged in user can not create an instrument', () => {
    return expect(
      instrumentMutations.create(null, {
        name: 'Test Instrument',
        shortCode: '2020-06-15',
        description: 'Test instrument description',
        managerUserId: 1,
      })
    ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
  });

  test('A logged in user officer can create an instrument', () => {
    const instrumentToCreate = {
      name: 'Test Instrument',
      shortCode: '2020-06-15',
      description: 'Test instrument description',
      managerUserId: 1,
    };

    return expect(
      instrumentMutations.create(dummyUserOfficerWithRole, instrumentToCreate)
    ).resolves.toStrictEqual({ id: 1, ...instrumentToCreate });
  });

  test('A logged in user officer can update instrument', () => {
    const instrumentToUpdate = {
      id: 1,
      name: 'Test Instrument 1',
      shortCode: '2020-06-15',
      description: 'Test instrument description 1',
      managerUserId: 1,
    };

    return expect(
      instrumentMutations.update(dummyUserOfficerWithRole, instrumentToUpdate)
    ).resolves.toStrictEqual({ ...instrumentToUpdate });
  });

  test('A logged in user officer can delete instrument', () => {
    return expect(
      instrumentMutations.delete(dummyUserOfficerWithRole, {
        id: 1,
      })
    ).resolves.toBe(dummyInstrument);
  });

  test('A logged in user officer can assign proposal/s to instrument', async () => {
    return expect(
      instrumentMutations.assignProposalsToInstruments(
        dummyUserOfficerWithRole,
        {
          proposalPks: [1, 2],
          instrumentIds: [1],
        }
      )
    ).resolves.toEqual({
      instrumentHasProposalIds: [1, 2],
      proposalPks: [1, 2],
      instrumentIds: [1],
      submitted: false,
    });
  });

  test('A logged in user officer can assign proposal/s to multiple instruments', async () => {
    return expect(
      instrumentMutations.assignProposalsToInstruments(
        dummyUserOfficerWithRole,
        {
          proposalPks: [1, 2],
          instrumentIds: [1, 2],
        }
      )
    ).resolves.toEqual({
      instrumentHasProposalIds: [1, 2, 3, 4],
      proposalPks: [1, 2],
      instrumentIds: [1, 2],
      submitted: false,
    });
  });

  test('A logged in user officer can remove assigned proposal from instrument', () => {
    return expect(
      instrumentMutations.removeProposalsFromInstrument(
        dummyUserOfficerWithRole,
        {
          proposalPks: [1],
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can assign scientist/s to instrument', () => {
    return expect(
      instrumentMutations.assignScientistsToInstrument(
        dummyUserOfficerWithRole,
        {
          scientistIds: [1, 2],
          instrumentId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can remove assigned scientist from instrument', () => {
    return expect(
      instrumentMutations.removeScientistFromInstrument(
        dummyUserOfficerWithRole,
        {
          scientistId: 1,
          instrumentId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can not set availability time on instrument to negative value', () => {
    return expect(
      instrumentMutations.setAvailabilityTimeOnInstrument(
        dummyUserOfficerWithRole,
        {
          callId: 1,
          instrumentId: 1,
          availabilityTime: -1,
        }
      )
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A logged in user officer can set availability time on instrument attached to a call', () => {
    return expect(
      instrumentMutations.setAvailabilityTimeOnInstrument(
        dummyUserOfficerWithRole,
        {
          callId: 1,
          instrumentId: 1,
          availabilityTime: 10,
        }
      )
    ).resolves.toBe(true);
  });

  test('A logged in user officer can submit instrument attached to a call from a Fap', () => {
    return expect(
      instrumentMutations.submitInstrumentInFap(dummyUserOfficerWithRole, {
        instrumentId: 1,
        callId: 1,
        fapId: 1,
      })
    ).resolves.toBe(dummyInstrumentHasProposals);
  });

  describe('Test Xpress instrument assignment', () => {
    test('A user officer can change the instrument of an Xpress proposal from any status', () => {
      const proposal = { statusId: 1 };

      jest.spyOn(statusDataSource, 'getAllStatuses').mockResolvedValue([
        {
          id: proposal.statusId,
          shortCode: 'EXPIRED',
          name: 'Expired',
          description: '',
          isDefault: true,
          entityType: 'proposal',
        },
      ]);

      return expect(
        instrumentMutations.assignXpressProposalsToInstruments(
          dummyUserOfficerWithRole,
          {
            proposalPks: [1, 2],
            instrumentIds: [1],
          }
        )
      ).resolves.toEqual({
        instrumentHasProposalIds: [1, 2],
        proposalPks: [1, 2],
        instrumentIds: [1],
        submitted: false,
      });
    });

    test('A scientist cannot change the instrument of an Xpress proposal from any status', () => {
      const proposal = { statusId: 1 };

      jest.spyOn(statusDataSource, 'getAllStatuses').mockResolvedValue([
        {
          id: proposal.statusId,
          shortCode: 'EXPIRED',
          name: 'Expired',
          description: '',
          isDefault: true,
          entityType: 'proposal',
        },
      ]);

      return expect(
        instrumentMutations.assignXpressProposalsToInstruments(
          dummyInstrumentScientist,
          {
            proposalPks: [1, 2],
            instrumentIds: [1],
          }
        )
      ).resolves.toEqual(
        expect.objectContaining({
          message: expect.stringContaining('forbidden current status'),
        })
      );
    });

    test('A scientist can change the instrument of an Xpress proposal when the status is under review', () => {
      const proposal = { statusId: 1 };

      jest.spyOn(statusDataSource, 'getAllStatuses').mockResolvedValue([
        {
          id: proposal.statusId,
          shortCode: 'UNDER_REVIEW',
          name: 'Under review',
          description: '',
          isDefault: true,
          entityType: 'proposal',
        },
      ]);

      return expect(
        instrumentMutations.assignXpressProposalsToInstruments(
          dummyInstrumentScientist,
          {
            proposalPks: [1, 2],
            instrumentIds: [1],
          }
        )
      ).resolves.toEqual({
        instrumentHasProposalIds: [1, 2],
        proposalPks: [1, 2],
        instrumentIds: [1],
        submitted: false,
      });
    });

    test('An instrument cannot be assigned if it does not belong to the technique of the proposal', () => {
      jest
        .spyOn(techniqueDataSource, 'getInstrumentsByTechniqueIds')
        .mockResolvedValue([
          {
            id: 5,
            name: 'Inst 1',
            shortCode: 'INST_1',
            description: '',
            managerUserId: 1,
          },
        ]);

      return expect(
        instrumentMutations.assignXpressProposalsToInstruments(
          dummyInstrumentScientist,
          {
            proposalPks: [1, 2],
            instrumentIds: [1],
          }
        )
      ).resolves.toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'instrument does not belong to proposal techniques'
          ),
        })
      );
    });

    test('An instrument can be assigned if it belongs to the technique of the proposal', () => {
      jest
        .spyOn(techniqueDataSource, 'getInstrumentsByTechniqueIds')
        .mockResolvedValue([
          {
            id: 1,
            name: 'Inst 1',
            shortCode: 'INST_1',
            description: '',
            managerUserId: 1,
          },
        ]);

      return expect(
        instrumentMutations.assignXpressProposalsToInstruments(
          dummyInstrumentScientist,
          {
            proposalPks: [1, 2],
            instrumentIds: [1],
          }
        )
      ).resolves.toEqual({
        instrumentHasProposalIds: [1, 2],
        proposalPks: [1, 2],
        instrumentIds: [1],
        submitted: false,
      });
    });
  });
});
