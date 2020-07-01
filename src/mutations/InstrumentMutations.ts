import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
  deleteInstrumentValidationSchema,
  assignProposalsToInstrumentValidationSchema,
  removeProposalFromInstrumentValidationSchema,
  assignScientistsToInstrumentValidationSchema,
  removeScientistFromInstrumentValidationSchema,
  setAvailabilityTimeOnInstrumentValidationSchema,
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
import {
  RemoveScientistFromInstrumentArgs,
  AssignScientistsToInstrumentArgs,
} from '../resolvers/mutations/AssignScientistsToInstrument';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';
import {
  UpdateInstrumentArgs,
  InstrumentAvailabilityTimeArgs,
} from '../resolvers/mutations/UpdateInstrumentMutation';
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

  @ValidateArgs(assignScientistsToInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignScientsitsToInstrument(
    agent: UserWithRole | null,
    args: AssignScientistsToInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignScientistsToInstrument(args.scientistIds, args.instrumentId)
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not assign scientist/s to instrument',
          error,
          {
            agent,
            args,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(removeScientistFromInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeScientistFromInstrument(
    agent: UserWithRole | null,
    args: RemoveScientistFromInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeScientistFromInstrument(args.scientistId, args.instrumentId)
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not remove assigned scientist/s from instrument',
          error,
          {
            agent,
            args,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(setAvailabilityTimeOnInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async setAvailabilityTimeOnInstrument(
    agent: UserWithRole | null,
    args: InstrumentAvailabilityTimeArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .setAvailabilityTimeOnInstrument(
        args.callId,
        args.instrumentId,
        args.availabilityTime
      )
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not set availability time on instrument',
          error,
          {
            agent,
            args,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }
}
