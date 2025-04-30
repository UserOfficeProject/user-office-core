import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  ProposalDataSourceMock,
  dummyProposalWithNotActiveCall,
  dummyProposalSubmitted,
  dummyProposal,
} from '../datasources/mockups/ProposalDataSource';
import { StatusDataSourceMock } from '../datasources/mockups/StatusDataSource';
import {
  dummyInstrumentScientist,
  dummyPrincipalInvestigatorWithRole,
  dummyUserNotOnProposal,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Proposal } from '../models/Proposal';
import { isRejection, Rejection } from '../models/Rejection';
import { Status } from '../models/Status';
import { WorkflowType } from '../models/Workflow';
import ProposalMutations from './ProposalMutations';

const proposalMutations = container.resolve(ProposalMutations);

let proposalDataSource: ProposalDataSourceMock;
let statusDataSource: StatusDataSourceMock;

beforeEach(() => {
  proposalDataSource = container.resolve<ProposalDataSourceMock>(
    Tokens.ProposalDataSource
  );
  proposalDataSource.init();

  statusDataSource = container.resolve<StatusDataSourceMock>(
    Tokens.StatusDataSource
  );
});

test('A user on the proposal can update its title if it is in edit mode', () => {
  const newTitle = 'New Title';
  const newAbstract = 'New Abstract';

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: 1,
      title: newTitle,
      abstract: newAbstract,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user can not create a proposal with blank title and abstract', () => {
  const newTitle = '';
  const newAbstract = '';

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: 1,
      title: newTitle,
      abstract: newAbstract,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user on the proposal can not update its title if it is not in edit mode', async () => {
  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: dummyProposalSubmitted.primaryKey,
      title: '',
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user-officer can update a proposal', async () => {
  const newTitle = 'New Title';
  const newAbstract = 'New Abstract';

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: 1,
      title: newTitle,
      abstract: newAbstract,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update a proposal even if the call is not active', async () => {
  const newTitle = 'New Title';
  const newAbstract = 'New Abstract';

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: dummyProposalWithNotActiveCall.primaryKey,
      title: newTitle,
      abstract: newAbstract,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can update submitted proposal', async () => {
  const newTitle = 'New Title';
  const newAbstract = 'New Abstract';
  await proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 1 });

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: 1,
      title: newTitle,
      abstract: newAbstract,
    })
  ).resolves.toHaveProperty('title', newTitle);
});

test('A user-officer can submit proposal even if the call is not active', async () => {
  const result = await proposalMutations.submit(dummyUserOfficerWithRole, {
    proposalPk: dummyProposalWithNotActiveCall.primaryKey,
  });

  return expect(isRejection(result)).toBe(false);
});

test('A user-officer can update a proposals score in submit mode', async () => {
  const newProposerId = 99;
  const newTitle = 'New Title';
  const newAbstract = 'New Abstract';
  await proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 1 });

  return expect(
    proposalMutations.update(dummyUserOfficerWithRole, {
      proposalPk: 1,
      proposerId: newProposerId,
      title: newTitle,
      abstract: newAbstract,
    })
  ).resolves.toHaveProperty('proposerId', newProposerId);
});

test('A user can not update a proposals score mode', async () => {
  const newProposerId = 99;

  return expect(
    proposalMutations.update(dummyUserWithRole, {
      proposalPk: dummyProposalSubmitted.primaryKey,
      proposerId: newProposerId,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user not on a proposal can not update it', () => {
  return expect(
    proposalMutations.update(dummyUserNotOnProposalWithRole, {
      proposalPk: 1,
      proposerId: dummyUserNotOnProposal.id,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A proposal cannot contain duplicate co-proposers', async () => {
  const pi = 1;
  const duplicateCoI = 4;
  const coIs = [2, 3, duplicateCoI, duplicateCoI];

  const updateResult = await proposalMutations.update(dummyUserWithRole, {
    proposalPk: 1,
    title: 'newTitle',
    abstract: 'newAbstract',
    users: coIs,
    proposerId: pi,
  });

  expect(updateResult).toEqual(
    expect.objectContaining({
      reason: 'Proposal contains a duplicate user',
      context: expect.objectContaining({
        duplicateUser: duplicateCoI,
      }),
    })
  );
});

test('A proposal PI cannot also be a co-proposer', async () => {
  const pi = 1;
  const coIs = [pi, 2, 3];

  const updateResult = await proposalMutations.update(dummyUserWithRole, {
    proposalPk: 1,
    title: 'newTitle',
    abstract: 'newAbstract',
    users: coIs,
    proposerId: pi,
  });

  expect(updateResult).toEqual(
    expect.objectContaining({
      reason: 'Proposal contains a duplicate user',
      context: expect.objectContaining({
        duplicateUser: pi,
      }),
    })
  );
});

//Submit

test('A user officer can not reject a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 99 })
  ).resolves.toHaveProperty(
    'reason',
    'Can not submit proposal, because proposal not found'
  );
});

test('A user officer can submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: 1 })
  ).resolves.toHaveProperty('submitted', true);
});

test('A user officer can not submit a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficerWithRole, { proposalPk: -1 })
  ).resolves.toHaveProperty(
    'reason',
    'Can not submit proposal, because proposal not found'
  );
});

test('A user on the proposal can submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserWithRole, { proposalPk: 1 })
  ).resolves.toHaveProperty('submitted', true);
});

test('A user on the proposal can not submit a proposal if the call is not active', async () => {
  const result = await proposalMutations.submit(dummyUserWithRole, {
    proposalPk: 3,
  });

  return expect(isRejection(result)).toBe(true);
});

test('A user not on the proposal cannot submit a proposal', () => {
  return expect(
    proposalMutations.submit(dummyUserNotOnProposalWithRole, { proposalPk: 1 })
  ).resolves.toHaveProperty(
    'reason',
    'Unauthorized submission of the proposal'
  );
});

test('A non-logged in user cannot submit a proposal', () => {
  return expect(
    proposalMutations.submit(null, { proposalPk: 1 })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('User officer can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserOfficerWithRole, { proposalPk: 1 })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserNotOnProposalWithRole, { proposalPk: 1 })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Principal investigator can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyPrincipalInvestigatorWithRole, {
      proposalPk: 1,
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('Principal investigator can not delete submitted proposal', async () => {
  return expect(
    proposalMutations.delete(dummyPrincipalInvestigatorWithRole, {
      proposalPk: dummyProposalSubmitted.primaryKey,
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not delete proposal because proposal is submitted'
  );
});

test('Has to be logged in to create proposal', () => {
  return expect(
    proposalMutations.create(null, { callId: 1 })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Can create a proposal', () => {
  return expect(
    proposalMutations.create(dummyUserWithRole, { callId: 1 })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User officer can set final status of a proposal', () => {
  return expect(
    proposalMutations.admin(dummyUserOfficerWithRole, {
      proposalPk: 1,
      finalStatus: 1,
      managementTimeAllocations: [{ instrumentId: 1, value: 1 }],
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot set final status of a proposal', () => {
  return expect(
    proposalMutations.admin(dummyUserNotOnProposalWithRole, {
      proposalPk: 1,
      finalStatus: 1,
      managementTimeAllocations: [{ instrumentId: 1, value: 1 }],
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('User cannot import a proposal', () => {
  return expect(
    proposalMutations.import(dummyUserWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
      submittedDate: new Date(),
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('User Officer can import a legacy proposal', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
      submittedDate: new Date(),
    })
  ).resolves.toBeInstanceOf(Proposal);
});

test('Proposal import is creating a proposal', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
      submittedDate: new Date(),
    })
  ).resolves.toHaveProperty('proposerId', 1);
});

test('Proposal import is updating the proposal', async () => {
  await proposalMutations.import(dummyUserOfficerWithRole, {
    submitterId: 1,
    referenceNumber: '21219999',
    callId: 1,
    title: 'new title',
    submittedDate: new Date(),
  });

  return expect(
    proposalDataSource.proposalsUpdated[0] //Hacky
  ).toHaveProperty('title', 'new title');
});

test('Proposal import is submitting the proposal', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: 1,
      submittedDate: new Date(),
    })
  ).resolves.toHaveProperty('proposalId', '21219999');
});

test('Proposal cannot be submitted without a call', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: -1,
      submittedDate: new Date(),
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Proposal can be submitted with techniques and instrument', () => {
  return expect(
    proposalMutations.import(dummyUserOfficerWithRole, {
      submitterId: 1,
      referenceNumber: '21219999',
      callId: -1,
      submittedDate: new Date(),
      techniqueIds: [1, 2],
      instrumentId: 1,
    })
  ).resolves.not.toBeInstanceOf(Proposal);
});

describe('Test technique proposal change status', () => {
  const draftId = 1;
  const submittedId = 2;
  const underReviewId = 3;
  const approvedId = 4;
  const unsuccessfulId = 5;
  const finishedId = 6;
  const nonTechniqueProposalId = 7;
  const expiredId = 7;

  const dummyProposalStatuses = [
    new Status(draftId, 'DRAFT', 'Draft', '', true, WorkflowType.PROPOSAL),
    new Status(
      submittedId,
      'SUBMITTED_LOCKED',
      'Submitted (locked)',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
    new Status(
      underReviewId,
      'UNDER_REVIEW',
      'Under review',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
    new Status(
      approvedId,
      'APPROVED',
      'Approved',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
    new Status(
      unsuccessfulId,
      'UNSUCCESSFUL',
      'Unsuccessful',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
    new Status(
      finishedId,
      'FINISHED',
      'Finished',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
    new Status(
      nonTechniqueProposalId,
      'NON-TP',
      'A non-technique proposal status',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
    new Status(
      expiredId,
      'EXPIRED',
      'Expired',
      '',
      true,
      WorkflowType.PROPOSAL
    ),
  ];

  beforeEach(() => {
    jest.restoreAllMocks();

    jest
      .spyOn(statusDataSource, 'getAllStatuses')
      .mockResolvedValue(dummyProposalStatuses);
  });

  test('A scientist cannot change status when a proposal is a draft', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: draftId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: underReviewId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('unmodifiable current status'),
      })
    );
  });

  test('A scientist cannot change status when a proposal is finished', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: finishedId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: underReviewId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('unmodifiable current status'),
      })
    );
  });

  test('A scientist cannot change status when a proposal is unsuccessful', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: unsuccessfulId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: underReviewId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('unmodifiable current status'),
      })
    );
  });

  test('A scientist cannot change status when a proposal is already in the status', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: underReviewId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: underReviewId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('same status'),
      })
    );
  });

  test('A scientist cannot change status when a non-technique proposal status is provided', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: submittedId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: nonTechniqueProposalId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('forbidden new status'),
      })
    );
  });

  test('A scientist cannot change status to draft', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: underReviewId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: underReviewId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: draftId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('forbidden new status'),
      })
    );
  });

  test('A scientist cannot change status to expired', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: underReviewId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: expiredId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('forbidden new status'),
      })
    );
  });

  test('A scientist cannot change status to submitted', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: underReviewId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: underReviewId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: submittedId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('forbidden new status'),
      })
    );
  });

  test('A scientist cannot change status when the current status and new status cannot connect', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: underReviewId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: approvedId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: finishedId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining('forbidden status transition'),
      })
    );
  });

  test('A scientist can change status to an allowed status', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: submittedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: submittedId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyInstrumentScientist,
        {
          statusId: underReviewId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        proposals: expect.arrayContaining([
          expect.objectContaining({
            primaryKey: 1,
            statusId: underReviewId,
          }),
          expect.objectContaining({
            primaryKey: 2,
            statusId: underReviewId,
          }),
        ]),
      })
    );
  });

  test('A user officer can change to/from any status', async () => {
    jest.spyOn(proposalDataSource, 'getProposalsByPks').mockResolvedValue([
      {
        ...dummyProposal,
        primaryKey: 1,
        statusId: finishedId,
      },
      {
        ...dummyProposal,
        primaryKey: 2,
        statusId: finishedId,
      },
    ]);

    return expect(
      proposalMutations.changeTechniqueProposalsStatus(
        dummyUserOfficerWithRole,
        {
          statusId: draftId,
          proposalPks: [1, 2],
        }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        proposals: expect.arrayContaining([
          expect.objectContaining({
            primaryKey: 1,
            statusId: draftId,
          }),
          expect.objectContaining({
            primaryKey: 2,
            statusId: draftId,
          }),
        ]),
      })
    );
  });
});
