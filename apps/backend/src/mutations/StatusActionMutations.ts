import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { Authorized } from '../decorators';
import {
  ConnectionHasStatusAction,
  StatusAction,
} from '../models/ProposalStatusAction';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';

@injectable()
export default class StatusActionMutations {
  constructor(
    @inject(Tokens.StatusDataSource)
    private dataSource: StatusActionsDataSource
  ) {}
  // @ValidateArgs(
  //   addStatusActionsToConnectionValidationSchema<
  //     ProposalStatusActionType,
  //     EmailStatusActionRecipients
  //   >(
  //     ProposalStatusActionType.EMAIL,
  //     ProposalStatusActionType.RABBITMQ,
  //     Object.values(ProposalStatusActionType),
  //     EmailStatusActionRecipients.OTHER
  //   )
  // )//TODO: To be done
  @Authorized([Roles.USER_OFFICER])
  async addConnectionStatusActions(
    agent: UserWithRole | null,
    connectionStatusActionsInput: AddConnectionStatusActionsInput,
    entityType: StatusAction['entityType']
  ): Promise<ConnectionHasStatusAction[] | null> {
    return this.dataSource.addConnectionStatusActions(
      connectionStatusActionsInput,
      entityType
    );
  }
}
