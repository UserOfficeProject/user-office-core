import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyTechnique1,
  dummyTechnique2,
} from '../datasources/mockups/TechniqueDataSource';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import TechniqueQueries from './TechniqueQueries';

const techniqueQueries = container.resolve(TechniqueQueries);

describe('Test Technique Queries', () => {
  test('A user officer can get a technique', () => {
    return expect(
      techniqueQueries.get(dummyUserOfficerWithRole, 1)
    ).resolves.toMatchObject(dummyTechnique1);
  });

  test('A not logged in user cannot get a technique', () => {
    return expect(techniqueQueries.get(null, 1)).resolves.toHaveProperty(
      'reason',
      'NOT_LOGGED_IN'
    );
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
    return expect(techniqueQueries.getAll(null)).resolves.toHaveProperty(
      'reason',
      'NOT_LOGGED_IN'
    );
  });
});
