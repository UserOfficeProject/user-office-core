import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyTechnique1 } from '../datasources/mockups/TechniqueDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import TechniqueMutations from './TechniqueMutations';

const techniqueMutations = container.resolve(TechniqueMutations);

describe('Test technique Mutations', () => {
  test('A user cannot create a technique', () => {
    return expect(
      techniqueMutations.create(dummyUserWithRole, {
        name: 'Test technique',
        shortCode: '2024-06-07',
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can create a technique', () => {
    const techniqueToCreate = {
      name: 'Dummy technique 1',
      shortCode: 'technique_1',
      description: 'Technique 1 description',
    };

    return expect(
      techniqueMutations.create(dummyUserOfficerWithRole, techniqueToCreate)
    ).resolves.toMatchObject({ id: 1, ...techniqueToCreate });
  });

  test('A user officer cannot create a technique with a short code greater than 20 characters', async () => {
    return expect(
      techniqueMutations.create(dummyUserWithRole, {
        name: 'Test technique',
        shortCode: 'a'.repeat(21),
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A user officer cannot create a technique with a name greater than 100 characters', async () => {
    return expect(
      techniqueMutations.create(dummyUserWithRole, {
        name: 'a'.repeat(101),
        shortCode: 'technique_1',
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A logged in user officer can update a technique', () => {
    const techniqueToUpdate = {
      id: 1,
      name: 'Dummy technique 1',
      shortCode: 'technique_1',
      description: 'Technique 1 description',
    };

    return expect(
      techniqueMutations.update(dummyUserOfficerWithRole, techniqueToUpdate)
    ).resolves.toStrictEqual({ ...techniqueToUpdate });
  });

  test('A user officer cannot update a technique with a short code greater than 20 characters', async () => {
    return expect(
      techniqueMutations.update(dummyUserWithRole, {
        id: 1,
        name: 'Test technique',
        shortCode: 'a'.repeat(21),
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A user officer cannot update a technique with a name greater than 100 characters', async () => {
    return expect(
      techniqueMutations.update(dummyUserWithRole, {
        id: 1,
        name: 'a'.repeat(101),
        shortCode: 'technique_1',
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'Input validation errors');
  });

  test('A user cannot update a technique', () => {
    return expect(
      techniqueMutations.update(dummyUserWithRole, {
        id: 1,
        name: 'Test technique',
        shortCode: '2024-06-07',
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can delete a technique', () => {
    return expect(
      techniqueMutations.delete(dummyUserOfficerWithRole, {
        id: 1,
      })
    ).resolves.toBe(dummyTechnique1);
  });

  test('A user cannot delete a technique', () => {
    return expect(
      techniqueMutations.delete(dummyUserWithRole, {
        id: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can assign instruments to a technique', async () => {
    return expect(
      techniqueMutations.assignInstrumentsToTechnique(
        dummyUserOfficerWithRole,
        {
          instrumentIds: [1, 2],
          techniqueId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A user cannot assign instruments to a technique', async () => {
    return expect(
      techniqueMutations.assignInstrumentsToTechnique(dummyUserWithRole, {
        instrumentIds: [1, 2],
        techniqueId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can remove an assigned instrument from a technique', async () => {
    return expect(
      techniqueMutations.removeInstrumentsFromTechnique(
        dummyUserOfficerWithRole,
        {
          instrumentIds: [1],
          techniqueId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A user cannot remove an assigned instrument from a technique', async () => {
    return expect(
      techniqueMutations.removeInstrumentsFromTechnique(dummyUserWithRole, {
        instrumentIds: [1],
        techniqueId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can assign techniques to a proposal', async () => {
    return expect(
      techniqueMutations.assignProposalToTechnique(dummyUserOfficerWithRole, {
        techniqueIds: [1, 2],
        proposalPk: 1,
      })
    ).resolves.toBe(true);
  });

  test('A user cannot assign techniques to a proposal', async () => {
    return expect(
      techniqueMutations.assignProposalToTechnique(dummyUserWithRole, {
        techniqueIds: [1, 2],
        proposalPk: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });
});
