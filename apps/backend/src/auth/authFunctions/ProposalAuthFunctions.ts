import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalContextData } from '../authContexts/ProposalAuthContext';
import { UserContextData } from '../authContexts/UserAuthContext';
import { AuthFunctionRegistry } from '../AuthRegistry';
import { ProposalAuthorization } from '../ProposalAuthorization';

@injectable()
export class ProposalAuthFunctions {
  constructor(
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  registry(): AuthFunctionRegistry<ProposalContextData> {
    return {
      isMemberOfProposal: async (user: UserContextData, obj) => {
        return await this.proposalAuth.isMemberOfProposal(
          user.id,
          obj.primaryKey
        );
      },
    };
  }
}
