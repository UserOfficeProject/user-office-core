import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyInstruments } from '../datasources/mockups/InstrumentDataSource';
import {
  dummyTechnique1,
  dummyTechnique2,
} from '../datasources/mockups/TechniqueDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import TechniqueQueries from './TechniqueQueries';

const techniqueQueries = container.resolve(TechniqueQueries);

describe('Test Technique Queries', () => {
  test('A user officer can get a technique', () => {
    return expect(
      techniqueQueries.get(dummyUserOfficerWithRole, 1)
    ).resolves.toMatchObject(dummyTechnique1);
  });

  test('A not logged in user cannot get a technique', () => {
    return expect(techniqueQueries.get(null, 1)).resolves.toBe(null);
  });

  test('A user officer can get techniques', () => {
    return expect(
      techniqueQueries.getAll(dummyUserOfficerWithRole)
    ).resolves.toStrictEqual({
      totalCount: 2,
      techniques: [dummyTechnique1, dummyTechnique2],
    });
  });

  test('A not logged in user cannot get techniques', () => {
    return expect(techniqueQueries.getAll(null)).resolves.toBe(null);
  });

  test('A user cannot get a technique', () => {
    return expect(techniqueQueries.get(dummyUserWithRole, 1)).resolves.toBe(
      null
    );
  });

  test('A user cannot get techniques', () => {
    return expect(techniqueQueries.getAll(dummyUserWithRole)).resolves.toBe(
      null
    );
  });

  test('A user officer can get instruments by technique id', () => {
    return expect(
      techniqueQueries.getInstrumentsByTechniqueId(dummyUserOfficerWithRole, 1)
    ).resolves.toMatchObject(dummyInstruments);
  });

  test('A not logged in user cannot get instruments by technique id', () => {
    return expect(
      techniqueQueries.getInstrumentsByTechniqueId(null, 1)
    ).resolves.toBe(null);
  });

  test('A user cannot get instruments by technique id', () => {
    return expect(
      techniqueQueries.getInstrumentsByTechniqueId(dummyUserWithRole, 1)
    ).resolves.toBe(null);
  });

  test('A user officer can get techniques by ids', () => {
    return expect(
      techniqueQueries.getTechniquesByIds(dummyUserWithRole, [1, 2])
    ).resolves.toStrictEqual([dummyTechnique1, dummyTechnique2]);
  });

  test('A not logged in user cannot get techniques by ids', () => {
    return expect(
      techniqueQueries.getTechniquesByIds(null, [1, 2])
    ).resolves.toBe(null);
  });
});
