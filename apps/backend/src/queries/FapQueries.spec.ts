import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  anotherDummyFap,
  dummyFap,
  dummyFapMembers,
  dummyFapProposal,
  dummyFaps,
} from '../datasources/mockups/FapDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import FapQueries from './FapQueries';

const FapQueriesInstance = container.resolve(FapQueries);

describe('Test FapQueries', () => {
  test('A user cannot query all Faps', () => {
    return expect(FapQueriesInstance.getAll(dummyUserWithRole)).resolves.toBe(
      null
    );
  });

  test('A userofficer can get all Faps if no filter is passed', () => {
    return expect(
      FapQueriesInstance.getAll(dummyUserOfficerWithRole, { active: false })
    ).resolves.toStrictEqual({ totalCount: 2, faps: dummyFaps });
  });

  test('A userofficer can get only `active` Faps', () => {
    return expect(
      FapQueriesInstance.getAll(dummyUserOfficerWithRole, { active: true })
    ).resolves.toStrictEqual({ totalCount: 1, faps: [dummyFap] });
  });

  test('A userofficer can filter Faps by `code` and `description`', () => {
    return expect(
      FapQueriesInstance.getAll(dummyUserOfficerWithRole, {
        active: false,
        filter: 'Fap 2',
      })
    ).resolves.toStrictEqual({ totalCount: 1, faps: [anotherDummyFap] });
  });

  test('A userofficer can get Faps paginated', () => {
    return expect(
      FapQueriesInstance.getAll(dummyUserOfficerWithRole, {
        active: false,
        filter: '',
        first: 1,
        offset: 1,
      })
    ).resolves.toStrictEqual({ totalCount: 1, faps: [dummyFap] });
  });

  test('A userofficer can get Fap by id', () => {
    return expect(
      FapQueriesInstance.get(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A userofficer can get Fap Members by Fap id', () => {
    return expect(
      FapQueriesInstance.getMembers(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(
      dummyFapMembers.filter((dummyFapMember) => dummyFapMember.fapId === 1)
    );
  });

  test('A userofficer can get Fap Proposals by Fap id', () => {
    return expect(
      FapQueriesInstance.getFapProposals(dummyUserOfficerWithRole, {
        fapId: 1,
        callId: 1,
      })
    ).resolves.toStrictEqual([dummyFapProposal]);
  });
});
