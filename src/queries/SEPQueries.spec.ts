import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  anotherDummySEP,
  dummySEP,
  dummySEPMembers,
  dummySEPProposal,
  dummySEPs,
} from '../datasources/mockups/SEPDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import SEPQueries from './SEPQueries';

const SEPQueriesInstance = container.resolve(SEPQueries);

describe('Test SEPQueries', () => {
  test('A user cannot query all SEPs', () => {
    return expect(SEPQueriesInstance.getAll(dummyUserWithRole)).resolves.toBe(
      null
    );
  });

  test('A userofficer can get all SEPs if no filter is passed', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficerWithRole, false)
    ).resolves.toStrictEqual({ totalCount: 2, seps: dummySEPs });
  });

  test('A userofficer can get only `active` SEPs', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficerWithRole, true)
    ).resolves.toStrictEqual({ totalCount: 1, seps: [dummySEP] });
  });

  test('A userofficer can filter SEPs by `code` and `description`', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficerWithRole, false, 'SEP 2')
    ).resolves.toStrictEqual({ totalCount: 1, seps: [anotherDummySEP] });
  });

  test('A userofficer can get SEPs paginated', () => {
    return expect(
      SEPQueriesInstance.getAll(dummyUserOfficerWithRole, false, '', 1, 1)
    ).resolves.toStrictEqual({ totalCount: 1, seps: [dummySEP] });
  });

  test('A userofficer can get SEP by id', () => {
    return expect(
      SEPQueriesInstance.get(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummySEP);
  });

  test('A userofficer can get SEP Members by SEP id', () => {
    return expect(
      SEPQueriesInstance.getMembers(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummySEPMembers);
  });

  test('A userofficer can get SEP Proposals by SEP id', () => {
    return expect(
      SEPQueriesInstance.getSEPProposals(dummyUserOfficerWithRole, {
        sepId: 1,
        callId: 1,
      })
    ).resolves.toStrictEqual([dummySEPProposal]);
  });
});
