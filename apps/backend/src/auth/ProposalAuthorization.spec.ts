import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import {
  dummyFapChairWithRole,
  dummyFapReviewerWithRole,
  dummyFapSecretaryWithRole,
  dummyInstrumentScientist,
  dummyInternalReviewer,
  dummyPrincipalInvestigatorWithRole,
  dummySampleReviewer,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
  dummyVisitorWithRole,
} from '../datasources/mockups/UserDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { TagDataSource } from '../datasources/TagDataSource';
import { AllocationTimeUnits } from '../models/Call';
import { Roles } from '../models/Role';
import { ProposalAuthorization } from './ProposalAuthorization';

const proposalAuthorization = container.resolve(ProposalAuthorization);

test('A user has access to a proposal they are PI on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyPrincipalInvestigatorWithRole, 1)
  ).resolves.toEqual(true);
});

test('A user has access to a proposal they are CoI on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyUserWithRole, 1)
  ).resolves.toEqual(true);
});

test('A user has access to a proposal they are Visiter on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyVisitorWithRole, 1)
  ).resolves.toEqual(true);
});

test('A user has does not access to a proposal they are not on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toEqual(false);
});

test('A internal reviewer has access to proposal they are reviewer on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyInternalReviewer, 1)
  ).resolves.toEqual(true);
});

test('A internal reviewer does not have access to proposal they are not reviewer on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(
      { ...dummyInternalReviewer, id: 100 },
      1
    )
  ).resolves.toEqual(false);
});

test('A FAP Reviewer has access to a proposal on their FAP', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyFapReviewerWithRole, 1)
  ).resolves.toEqual(true);
});

test('A FAP Sec has access to a proposal on their FAP', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyFapSecretaryWithRole, 1)
  ).resolves.toEqual(true);
});

test('A FAP Chair has access to a proposal on their FAP', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyFapChairWithRole, 1)
  ).resolves.toEqual(true);
});

test('A FAP Reviewer does not have access to a proposal not on their FAP', async () => {
  return expect(
    proposalAuthorization.hasReadRights(
      { ...dummyFapReviewerWithRole, id: 3 },
      1
    )
  ).resolves.toEqual(false);
});

test('A FAP Sec does not have access to a proposal not on their FAP', async () => {
  return expect(
    proposalAuthorization.hasReadRights(
      { ...dummyFapSecretaryWithRole, id: 3 },
      1
    )
  ).resolves.toEqual(false);
});

test('A FAP Chair does not have access to a proposal not on their FAP', async () => {
  return expect(
    proposalAuthorization.hasReadRights({ ...dummyFapChairWithRole, id: 3 }, 1)
  ).resolves.toEqual(false);
});

test('A instrument sci can access proposals they are on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyInstrumentScientist, 1)
  ).resolves.toEqual(true);
});

test('A instrument sci cannot access proposals they are not on', async () => {
  return expect(
    proposalAuthorization.hasReadRights(
      {
        ...dummyUserNotOnProposalWithRole,
        currentRole: {
          id: 1,
          title: 'Instrument Scientist',
          shortCode: 'instrument_scientist',
          description: '',
          permissions: [],
          isRootRole: false,
        },
      },
      1
    )
  ).resolves.toEqual(false);
});

test('A user officer has access to any proposal', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummyUserOfficerWithRole, 1)
  ).resolves.toEqual(true);
});

test('A sample reviewer has access to any proposal', async () => {
  return expect(
    proposalAuthorization.hasReadRights(dummySampleReviewer, 1)
  ).resolves.toEqual(true);
});

test('A proposal reader has access to proposal matching their instrument', async () => {
  const proposalReader = {
    ...dummyUserWithRole,
    currentRole: {
      id: 10,
      title: 'Proposal Reader',
      shortCode: Roles.PROPOSAL_READER,
      description: '',
      permissions: [],
      isRootRole: false,
    },
  };

  const roleDataSource = container.resolve<RoleDataSource>(
    Tokens.RoleDataSource
  );
  const tagDataSource = container.resolve<TagDataSource>(Tokens.TagDataSource);
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  jest
    .spyOn(proposalDataSource, 'get')
    .mockResolvedValue({ primaryKey: 1, callId: 100 } as any);

  // NOTE: This mock is for "proposal_reader" role which returns tags
  jest
    .spyOn(roleDataSource, 'getTagsByRoleId')
    .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);

  // NOTE: This mock returns instruments associated with the tags
  jest.spyOn(tagDataSource, 'getTagInstruments').mockResolvedValue([
    {
      id: 1,
      name: 'Instr1',
      shortCode: 'I1',
      description: '',
      managerUserId: 1,
    },
  ]);

  jest.spyOn(tagDataSource, 'getTagCalls').mockResolvedValue([]);

  // NOTE: This mock returns instruments associated with the proposal
  jest
    .spyOn(instrumentDataSource, 'getInstrumentsByProposalPk')
    .mockResolvedValue([
      {
        id: 1,
        name: 'Instr1',
        shortCode: 'I1',
        description: '',
        managerUserId: 1,
        managementTimeAllocation: 0,
      },
    ]);

  return expect(
    proposalAuthorization.hasReadRights(proposalReader, 1)
  ).resolves.toEqual(true);
});

test('A proposal reader does not have access to proposal not matching their instrument or call', async () => {
  const proposalReader = {
    ...dummyUserWithRole,
    currentRole: {
      id: 10,
      title: 'Proposal Reader',
      shortCode: Roles.PROPOSAL_READER,
      description: '',
      permissions: [],
      isRootRole: false,
    },
  };

  const roleDataSource = container.resolve<RoleDataSource>(
    Tokens.RoleDataSource
  );
  const tagDataSource = container.resolve<TagDataSource>(Tokens.TagDataSource);
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  jest
    .spyOn(proposalDataSource, 'get')
    .mockResolvedValue({ primaryKey: 1, callId: 100 } as any);

  jest
    .spyOn(roleDataSource, 'getTagsByRoleId')
    .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);

  jest.spyOn(tagDataSource, 'getTagInstruments').mockResolvedValue([
    {
      id: 1,
      name: 'Instr1',
      shortCode: 'I1',
      description: '',
      managerUserId: 1,
    },
  ]);
  jest.spyOn(tagDataSource, 'getTagCalls').mockResolvedValue([]);

  jest
    .spyOn(instrumentDataSource, 'getInstrumentsByProposalPk')
    .mockResolvedValue([
      {
        id: 2,
        name: 'Instr2',
        shortCode: 'I2',
        description: '',
        managerUserId: 1,
        managementTimeAllocation: 0,
      },
    ]);

  return expect(
    proposalAuthorization.hasReadRights(proposalReader, 1)
  ).resolves.toEqual(false);
});

test('A proposal reader has access to proposal matching their call', async () => {
  const proposalReader = {
    ...dummyUserWithRole,
    currentRole: {
      id: 10,
      title: 'Proposal Reader',
      shortCode: Roles.PROPOSAL_READER,
      description: '',
      permissions: [],
      isRootRole: false,
    },
  };

  const roleDataSource = container.resolve<RoleDataSource>(
    Tokens.RoleDataSource
  );
  const tagDataSource = container.resolve<TagDataSource>(Tokens.TagDataSource);
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  jest
    .spyOn(proposalDataSource, 'get')
    .mockResolvedValue({ primaryKey: 1, callId: 50 } as any);

  jest
    .spyOn(roleDataSource, 'getTagsByRoleId')
    .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);

  jest.spyOn(tagDataSource, 'getTagInstruments').mockResolvedValue([]);
  jest.spyOn(tagDataSource, 'getTagCalls').mockResolvedValue([
    {
      id: 50,
      shortCode: 'C1',
      startCall: new Date(),
      endCall: new Date(),
      startReview: new Date(),
      endReview: new Date(),
      startFapReview: new Date(),
      endFapReview: new Date(),
      startNotify: new Date(),
      endNotify: new Date(),
      startCycle: new Date(),
      endCycle: new Date(),
      cycleComment: '',
      surveyComment: '',
      proposalSequence: 1,
      isActive: true,
      referenceNumberFormat: '',
      proposalWorkflowId: 1,
      templateId: 1,
      esiTemplateId: 1,
      allocationTimeUnit: AllocationTimeUnits.Day,
      title: 'C1',
      description: '',
      endCallInternal: new Date(),
      submissionMessage: '',
      callEnded: false,
      callEndedInternal: false,
      callReviewEnded: false,
      callFapReviewEnded: false,
      proposalPdfTemplateId: 1,
      experimentSafetyPdfTemplateId: 1,
      fapReviewTemplateId: 1,
      technicalReviewTemplateId: 1,
      sort_order: 1,
      experimentWorkflowId: 1,
    },
  ]);

  jest
    .spyOn(instrumentDataSource, 'getInstrumentsByProposalPk')
    .mockResolvedValue([]);

  return expect(
    proposalAuthorization.hasReadRights(proposalReader, 1)
  ).resolves.toEqual(true);
});
