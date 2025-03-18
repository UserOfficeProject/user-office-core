import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../datasources/mockups/CoProposerClaimDataSource';
import { InviteDataSourceMock } from '../datasources/mockups/InviteDataSource';
import { RoleClaimDataSourceMock } from '../datasources/mockups/RoleClaimDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import InviteMutations from '../mutations/InviteMutations';
import InviteQueries from './InviteQueries';

describe('InviteQueries', () => {
  let inviteQueries: InviteQueries;
  let inviteMutations: InviteMutations;

  beforeAll(() => {
    inviteQueries = container.resolve(InviteQueries);
    inviteMutations = container.resolve(InviteMutations);
  });

  beforeEach(() => {
    container.resolve<InviteDataSourceMock>(Tokens.InviteDataSource).init();
    container
      .resolve<RoleClaimDataSourceMock>(Tokens.RoleClaimDataSource)
      .init();
    container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .init();
  });

  describe('getCoProposerInvites', () => {
    it('An authorized user should get co-proposer invites', async () => {
      const proposalPk = 1;
      const email = faker.internet.email();
      const note = faker.lorem.sentence();

      await inviteMutations.create(dummyUserWithRole, {
        email,
        note,
        claims: { coProposerProposalPk: proposalPk },
      });

      const invites = await inviteQueries.getCoProposerInvites(
        dummyUserWithRole,
        proposalPk
      );

      expect(invites).toEqual(
        expect.arrayContaining([expect.objectContaining({ email, note })])
      );
    });

    it('An unauthorized user should get an empty invite list', async () => {
      const proposalPk = 1;
      const email = faker.internet.email();
      const note = faker.lorem.sentence();

      await inviteMutations.create(dummyUserWithRole, {
        email,
        note,
        claims: { coProposerProposalPk: proposalPk },
      });

      const invites = await inviteQueries.getCoProposerInvites(
        null,
        proposalPk
      );

      // Assert that the invites array does not include any object with the provided email and note.
      expect(invites).toEqual(
        expect.not.arrayContaining([expect.objectContaining({ email, note })])
      );
    });
  });
});
