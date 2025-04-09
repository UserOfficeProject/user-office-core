import { container } from 'tsyringe';

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
