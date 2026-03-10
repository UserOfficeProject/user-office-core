import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  anotherDummyFap,
  dummyFap,
  dummyFapMembers,
  dummyFapProposal,
  dummyFapReviewPeriodEnded,
  dummyFaps,
} from '../datasources/mockups/FapDataSource';
import {
  dummyFapReviewerWithRole,
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
    ).resolves.toStrictEqual({ totalCount: 5, faps: dummyFaps });
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
    ).resolves.toStrictEqual({
      totalCount: 1,
      faps: [dummyFapReviewPeriodEnded],
    });
  });

  test('A userofficer can get Fap by id', () => {
    return expect(
      FapQueriesInstance.get(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummyFap);
  });

  test('A userofficer can get Fap Members by Fap id', () => {
    return expect(
      FapQueriesInstance.getMembers(dummyUserOfficerWithRole, 1)
    ).resolves.toStrictEqual(dummyFapMembers);
  });

  test('A userofficer can get Fap Proposals by Fap id', () => {
    return expect(
      FapQueriesInstance.getFapProposals(dummyUserOfficerWithRole, {
        fapId: 1,
        callId: 1,
        instrumentId: 1,
        legacy: false,
      })
    ).resolves.toStrictEqual([dummyFapProposal]);
  });

  describe('reviewer visibility tests', () => {
    //Info for reviewer visibility tests
    //Reviewer Id 2

    // Proposal 100 -> call_fap_review_ended: false, proposal_all_fap_reviews_submitted: false
    // Proposal 101 -> call_fap_review_ended: true, proposal_all_fap_reviews_submitted: true

    // Fap 3 -> PROPOSAL_REVIEWS_COMPLETE
    // Fap 4 -> REVIEWS_VISIBLE_FAP_ENDED
    // Fap 5 -> REVIEWS_VISIBLE
    let dataSourceSpy: jest.SpyInstance;

    beforeEach(() => {
      dataSourceSpy = jest.spyOn(
        FapQueriesInstance['dataSource'],
        'getFapProposalAssignments'
      );
    });

    afterEach(() => {
      dataSourceSpy.mockRestore();
    });

    test('A userofficer can get proposal assignments no matter the review visibility', async () => {
      const fapId = 3;
      const proposalPk = 100;

      await FapQueriesInstance.getFapProposalAssignments(
        dummyUserOfficerWithRole,
        { fapId, proposalPk }
      );

      expect(dataSourceSpy).toHaveBeenCalledWith(fapId, proposalPk, null);
    });

    test('A reviewer gets filtered assignments when PROPOSAL_REVIEWS_COMPLETE and not all reviews are in', async () => {
      const fapId = 3;
      const proposalPk = 100;

      await FapQueriesInstance.getFapProposalAssignments(
        dummyFapReviewerWithRole,
        { fapId, proposalPk }
      );

      expect(dataSourceSpy).toHaveBeenCalledWith(
        fapId,
        proposalPk,
        dummyFapReviewerWithRole.id
      );
    });

    test('A reviewer gets filtered assignments when REVIEWS_VISIBLE_FAP_ENDED and fap is still in review', async () => {
      const fapId = 4;
      const proposalPk = 100;

      await FapQueriesInstance.getFapProposalAssignments(
        dummyFapReviewerWithRole,
        { fapId, proposalPk }
      );

      expect(dataSourceSpy).toHaveBeenCalledWith(
        fapId,
        proposalPk,
        dummyFapReviewerWithRole.id
      );
    });

    test('A reviewer gets unfiltered assignments when REVIEWS_VISIBLE_FAP_ENDED and fap review is finished', async () => {
      const fapId = 4;
      const proposalPk = 101;

      await FapQueriesInstance.getFapProposalAssignments(
        dummyFapReviewerWithRole,
        { fapId, proposalPk }
      );

      expect(dataSourceSpy).toHaveBeenCalledWith(fapId, proposalPk, null);
    });

    test('A reviewer gets unfiltered assignments when REVIEWS_VISIBLE', async () => {
      const fapId = 5;
      const proposalPk = 100;

      await FapQueriesInstance.getFapProposalAssignments(
        dummyFapReviewerWithRole,
        { fapId, proposalPk }
      );

      expect(dataSourceSpy).toHaveBeenCalledWith(fapId, proposalPk, null);
    });
  });
});
