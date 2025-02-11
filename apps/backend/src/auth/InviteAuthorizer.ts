import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserRole, UserWithRole } from '../models/User';
import { ClaimsInput } from '../resolvers/mutations/CreateInviteMutation';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class InviteAuthorization {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  public async hasCreateRights(
    agent: UserWithRole | null,
    claims: ClaimsInput
  ): Promise<boolean> {
    if (this.userAuth.isUserOfficer(agent)) return true;

    const { roleIds, coProposerProposalPk } = claims;

    if (roleIds !== undefined) {
      const onlyUserRole = roleIds.length === 1 && roleIds[0] === UserRole.USER;

      if (!onlyUserRole) return false;
    }

    if (coProposerProposalPk !== undefined) {
      const isMemberOfProposal = await this.proposalAuth.isMemberOfProposal(
        agent,
        coProposerProposalPk
      );

      if (!isMemberOfProposal) return false;
    }

    return true;
  }

  public async hasReadRights(agent: UserWithRole | null, proposalPk: number) {
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);
    const isMemberOfProposal = await this.proposalAuth.isMemberOfProposal(
      agent,
      proposalPk
    );

    if (!isUserOfficer && !isMemberOfProposal) return false;
  }
}
