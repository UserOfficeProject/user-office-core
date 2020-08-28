import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
  deleteInstrumentValidationSchema,
  assignProposalsToInstrumentValidationSchema,
  removeProposalFromInstrumentValidationSchema,
  assignScientistsToInstrumentValidationSchema,
  removeScientistFromInstrumentValidationSchema,
  setAvailabilityTimeOnInstrumentValidationSchema,
  submitInstrumentValidationSchema,
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
  InstrumentSubmitArgs,
} from '../resolvers/mutations/UpdateInstrumentMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class InstrumentMutations {
  constructor(
    private dataSource: InstrumentDataSource,
    private userAuth: UserAuthorization
  ) {}

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
          instrumentId: args.id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .delete(args.id)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not delete instrument', error, {
          agent,
          instrumentId: args.id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async checkIfProposalsAreOnSameCallAsInstrument(
    inputArguments: AssignProposalsToInstrumentArgs
  ) {
    const proposalCallIds = inputArguments.proposals.map(
      proposal => proposal.callId
    );
    const proposalCallsWithInstrument = await this.dataSource.getCallsByInstrumentId(
      inputArguments.instrumentId,
      proposalCallIds
    );

    const proposalsOnSameCallAsInstrument = inputArguments.proposals.filter(
      proposal =>
        proposalCallsWithInstrument.some(
          call => call.callId === proposal.callId
        )
    );

    return (
      proposalsOnSameCallAsInstrument.length === inputArguments.proposals.length
    );
  }

  @ValidateArgs(assignProposalsToInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToInstrument(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentArgs
  ): Promise<boolean | Rejection> {
    const allProposalsAreOnSameCallAsInstrument = await this.checkIfProposalsAreOnSameCallAsInstrument(
      args
    );

    if (!allProposalsAreOnSameCallAsInstrument) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .assignProposalsToInstrument(
        args.proposals.map(proposal => proposal.id),
        args.instrumentId
      )
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not assign proposal/s to instrument',
          error,
          {
            agent,
            instrumentId: args.instrumentId,
            proposals: args.proposals,
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

  @ValidateArgs(submitInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async submitInstrument(
    agent: UserWithRole | null,
    args: InstrumentSubmitArgs
  ): Promise<boolean | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(
        (agent as UserWithRole).id,
        args.sepId
      ))
    ) {
      return rejection('NOT_ALLOWED');
    }

    // TODO: Maybe we should check first if all proposals under this instrument in the SEP have rankings and then submit the instrument.
    return this.dataSource
      .submitInstrument(args.callId, args.instrumentId)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not submit instrument', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}
