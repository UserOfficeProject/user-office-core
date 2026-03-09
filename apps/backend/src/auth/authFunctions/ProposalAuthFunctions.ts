import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { ProposalContextData } from '../authContexts/ProposalAuthContext';
import { UserContextData } from '../authContexts/UserAuthContext';
import { AuthFunctionRegistry } from '../AuthRegistry';
import { ProposalAuthorization } from '../ProposalAuthorization';

@injectable()
export class ProposalAuthFunctions {
  constructor(
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource
  ) {}

  private get proposalAuth(): ProposalAuthorization {
    return container.resolve<ProposalAuthorization>(
      Tokens.ProposalAuthorization
    );
  }

  registry(): AuthFunctionRegistry<ProposalContextData> {
    return {
      isMemberOfProposal: async (user: UserContextData, obj) => {
        return await this.proposalAuth.isMemberOfProposal(
          user.id,
          obj.primaryKey
        );
      },
      isCallEnded: async (user: UserContextData, obj) => {
        return await this.callDataSource.isCallEnded(obj.callId);
      },
      isCallEndedInternal: async (user: UserContextData, obj) => {
        return await this.callDataSource.isCallEnded(obj.callId, true);
      },
    };
  }
}
