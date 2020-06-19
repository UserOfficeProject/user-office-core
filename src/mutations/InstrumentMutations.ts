import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
  deleteInstrumentValidationSchema,
} from '@esss-swap/duo-validation';

import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Instrument } from '../models/Instrument';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';
import { UpdateInstrumentArgs } from '../resolvers/mutations/UpdateInstrumentMutation';
import { logger } from '../utils/Logger';

export default class InstrumentMutations {
  constructor(private dataSource: InstrumentDataSource) {}

  @ValidateArgs(createInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateInstrumentArgs
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .create(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not create instrument', error, {
          agent,
          shortCode: args.shortCode,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateInstrumentArgs
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .update(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not update instrument', error, {
          agent,
          instrumentId: args.instrumentId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { instrumentId: number }
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .delete(args.instrumentId)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not delete instrument', error, {
          agent,
          instrumentId: args.instrumentId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}
