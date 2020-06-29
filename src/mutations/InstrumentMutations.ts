import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
  deleteInstrumentValidationSchema,
  assignProposalsToInstrumentValidationSchema,
  removeProposalFromInstrumentValidationSchema,
} from '@esss-swap/duo-validation';

import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Instrument } from '../models/Instrument';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import {
  AssignProposalsToInstrumentArgs,
  RemoveProposalsFromInstrumentArgs,
} from '../resolvers/mutations/AssignProposalsToInstrumentMutation';
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

  @ValidateArgs(assignProposalsToInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToInstrument(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignProposalsToInstrument(args.proposalIds, args.instrumentId)
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not assign proposal/s to instrument',
          error,
          {
            agent,
            instrumentId: args.instrumentId,
            proposalIds: args.proposalIds,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(removeProposalFromInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeProposalFromInstrument(
    agent: UserWithRole | null,
    args: RemoveProposalsFromInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeProposalFromInstrument(args.proposalId, args.instrumentId)
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not remove assigned proposal/s from instrument',
          error,
          {
            agent,
            instrumentId: args.instrumentId,
            proposalId: args.proposalId,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }
}
