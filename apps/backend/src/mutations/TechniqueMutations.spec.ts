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

  test('A logged in user officer can update a technique', () => {
    const techniqueToUpdate = {
      techniqueId: 1,
      name: 'Dummy technique 1',
      shortCode: 'technique_1',
      description: 'Technique 1 description',
    };

    return expect(
      techniqueMutations.update(dummyUserOfficerWithRole, techniqueToUpdate)
    ).resolves.toStrictEqual({ ...techniqueToUpdate });
  });

  test('A user cannot update a technique', () => {
    return expect(
      techniqueMutations.update(dummyUserWithRole, {
        techniqueId: 1,
        name: 'Test technique',
        shortCode: '2024-06-07',
        description: 'Test technique description',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can delete a technique', () => {
    return expect(
      techniqueMutations.delete(dummyUserOfficerWithRole, {
        techniqueId: 1,
      })
    ).resolves.toBe(dummyTechnique1);
  });

  test('A user cannot delete a technique', () => {
    return expect(
      techniqueMutations.delete(dummyUserWithRole, {
        techniqueId: 1,
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
      techniqueMutations.removeInstrumentFromTechnique(
        dummyUserOfficerWithRole,
        {
          instrumentId: 1,
          techniqueId: 1,
        }
      )
    ).resolves.toBe(true);
  });

  test('A user cannot remove an assigned instrument from a technique', async () => {
    return expect(
      techniqueMutations.removeInstrumentFromTechnique(dummyUserWithRole, {
        instrumentId: 1,
        techniqueId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });
});
