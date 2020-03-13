/* eslint-disable prettier/prettier */
import 'reflect-metadata';

import {
  dummyProposalSubmitted,
  dummyProposal,
  ProposalDataSourceMock,
} from '../datasources/mockups/ProposalDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventBus } from '../events/eventBus';
import { Proposal } from '../models/Proposal';
import { DataType } from '../models/ProposalModel';
import { User } from '../models/User';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import ProposalMutations from './ProposalMutations';

const dummyLogger = new MutedLogger();
const dummyEventBus = new EventBus<ApplicationEvent>();
const dummyProposalDataSource = new ProposalDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const proposalMutations = new ProposalMutations(
  dummyProposalDataSource,
  dummyTemplateDataSource,
  userAuthorization,
  dummyEventBus,
  dummyLogger
);

beforeEach(() => {
  dummyProposalDataSource.init();
});

// TODO: See if we can use camelcase here.
/* eslint-disable @typescript-eslint/camelcase */
function tryUpdateProposal(user: User, proposalId: number) {
  return proposalMutations.update(user, {
    id: proposalId,
    title: 'Cras nulla nibh, dictum nec rhoncus eget, lobortis vel augue.',
    abstract:
      'Project abstract descriptionPellentesque lacinia, orci at feugiat pretium, purus quam feugiat nisl, aliquet ultrices lectus lectus sed mauris.',
    answers: [
      {
        proposal_question_id: 'fasta_seq',
        data_type: DataType.TEXT_INPUT,
        value: '{"value": "ADQLTEEQIAEFKEAFSLFDKDGDGTITTKELG*"}',
      },
    ],
  });
}
/* eslint-enable @typescript-eslint/camelcase */

test('A user on the proposal can update it\'s title if it is in edit mode', () => {
  return expect(tryUpdateProposal(dummyUser, 1)).resolves.toBe(dummyProposal);
});

test('A user on the proposal can\'t update it\'s title if it is not in edit mode', () => {
  return expect(tryUpdateProposal(dummyUser, 2)).resolves.toHaveProperty(
    'reason',
    'NOT_ALLOWED_PROPOSAL_SUBMITTED'
  );
});

test('A user-officer can update a proposal in edit mode', () => {
  return expect(tryUpdateProposal(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test('A user-officer can update a proposal in submit mode', () => {
  return expect(tryUpdateProposal(dummyUserOfficer, 2)).resolves.toBe(
    dummyProposalSubmitted
  );
});

test('A user-officer can update a proposals score in submit mode', () => {
  return expect(
    proposalMutations.update(dummyUserOfficer, {
      id: dummyProposalSubmitted.id,
      proposerId: 2,
    })
  ).resolves.toBe(dummyProposalSubmitted);
});

test('A user can not update a proposals score mode', () => {
  return expect(
    proposalMutations.update(dummyUser, {
      id: dummyProposalSubmitted.id,
      proposerId: 2,
    })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED_PROPOSAL_SUBMITTED');
});

test('A user not on a proposal can not update it', () => {
  return expect(
    tryUpdateProposal(dummyUserNotOnProposal, 1)
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

//Submit

test('A user officer can not reject a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficer, -1)
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
});

test('A user officer can submit a proposal ', () => {
  return expect(proposalMutations.submit(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test('A user officer can not submit a proposal that does not exist', () => {
  return expect(
    proposalMutations.submit(dummyUserOfficer, -1)
  ).resolves.toHaveProperty('reason', 'INTERNAL_ERROR');
});

test('A user on the proposal can submit a proposal ', () => {
  return expect(proposalMutations.submit(dummyUser, 1)).resolves.toBe(
    dummyProposal
  );
});

test('A user not on the proposal cannot submit a proposal ', () => {
  return expect(
    proposalMutations.submit(dummyUserNotOnProposal, 1)
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A non-logged in user cannot submit a proposal', () => {
  return expect(proposalMutations.submit(null, 1)).resolves.toHaveProperty(
    'reason',
    'NOT_LOGGED_IN'
  );
});

test('A user can attach files', () => {
  const dummyFileList = ['1020597501870552'];

  return expect(
    proposalMutations.updateFiles(dummyUser, {
      proposalId: 1,
      questionId: 'reference_files',
      files: dummyFileList,
    })
  ).resolves.toBe(dummyFileList);
});

test('A non-belonging should not be able to attach files', () => {
  const dummyFileList = ['1020597501870552'];

  return expect(
    proposalMutations.updateFiles(dummyUserNotOnProposal, {
      proposalId: 1,
      questionId: 'reference_files',
      files: dummyFileList,
    })
  ).resolves.not.toBe(dummyFileList);
});

test('User must have valid session to attach files', () => {
  return expect(
    proposalMutations.updateFiles(null, {
      proposalId: 1,
      questionId: 'reference_files',
      files: ['1020597501870552'],
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('User officer can delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserOfficer, 1)
  ).resolves.toBeInstanceOf(Proposal);
});

test('User cannot delete a proposal', () => {
  return expect(
    proposalMutations.delete(dummyUserNotOnProposal, 1)
  ).resolves.not.toBeInstanceOf(Proposal);
});

test('Has to be logged in to create proposal', () => {
  return expect(proposalMutations.create(null)).resolves.not.toBeInstanceOf(
    Proposal
  );
});

test('Can create a proposal', () => {
  return expect(proposalMutations.create(dummyUser)).resolves.toBeInstanceOf(
    Proposal
  );
});
