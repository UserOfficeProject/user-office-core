import {
  createStatusValidationSchema,
  deleteStatusValidationSchema,
  updateStatusValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Status } from '../models/ProposalStatus';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateStatusInput } from '../resolvers/mutations/settings/CreateStatusMutation';
import { UpdateStatusInput } from '../resolvers/mutations/settings/UpdateStatusMutation';

@injectable()
export default class StatusMutations {
  constructor(
    @inject(Tokens.StatusDataSource)
    private dataSource: StatusDataSource
  ) {}

  @ValidateArgs(createStatusValidationSchema) //TODO: To be done
  @Authorized([Roles.USER_OFFICER])
  async createStatus(
    agent: UserWithRole | null,
    args: CreateStatusInput
  ): Promise<Status | Rejection> {
    return this.dataSource.createStatus(args).catch((error) => {
      return rejection(
        'Could not create proposal status',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(updateStatusValidationSchema) //TODO: To be done
  @Authorized([Roles.USER_OFFICER])
  async updateStatus(
    agent: UserWithRole | null,
    args: UpdateStatusInput
  ): Promise<Status | Rejection> {
    return this.dataSource.updateStatus(args).catch((error) => {
      return rejection(
        'Could not update proposal status',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(deleteStatusValidationSchema) //TODO: To be done
  @Authorized([Roles.USER_OFFICER])
  async deleteStatus(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<Status | Rejection> {
    return this.dataSource.deleteStatus(args.id).catch((error) => {
      return rejection(
        'Could not delete proposal status',
        { agent, args },
        error
      );
    });
  }
}
