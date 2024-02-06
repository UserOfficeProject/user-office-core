import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
  deleteInstrumentValidationSchema,
  assignScientistsToInstrumentValidationSchema,
  removeScientistFromInstrumentValidationSchema,
  setAvailabilityTimeOnInstrumentValidationSchema,
  submitInstrumentValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Instrument, InstrumentHasProposals } from '../models/Instrument';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  AssignProposalsToInstrumentsArgs,
  RemoveProposalsFromInstrumentArgs,
} from '../resolvers/mutations/AssignProposalsToInstrumentsMutation';
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
import { sortByRankOrAverageScore } from '../utils/mathFunctions';
import { ApolloServerErrorCodeExtended } from '../utils/utilTypes';
import { ProposalDataSource } from './../datasources/ProposalDataSource';
@injectable()
export default class InstrumentMutations {
  constructor(
    @inject(Tokens.InstrumentDataSource)
    private dataSource: InstrumentDataSource,
    @inject(Tokens.FapDataSource) private fapDataSource: FapDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  @EventBus(Event.INSTRUMENT_CREATED)
  @ValidateArgs(createInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateInstrumentArgs
  ): Promise<Instrument | Rejection> {
    return this.dataSource.create(args).catch((error) => {
      return rejection(
        'Could not create instrument',
        { agent, shortCode: args.shortCode },
        error
      );
    });
  }

  @EventBus(Event.INSTRUMENT_UPDATED)
  @ValidateArgs(updateInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateInstrumentArgs
  ): Promise<Instrument | Rejection> {
    return this.dataSource.update(args).catch((error) => {
      return rejection(
        'Could not update instrument',
        { agent, instrumentId: args.id },
        error
      );
    });
  }

  @EventBus(Event.INSTRUMENT_DELETED)
  @ValidateArgs(deleteInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<Instrument | Rejection> {
    return this.dataSource.delete(args.id).catch((error) => {
      return rejection(
        'Could not delete instrument',
        { agent, instrumentId: args.id },
        error
      );
    });
  }

  async checkIfProposalsAreOnSameCallAsInstrument(
    inputArguments: AssignProposalsToInstrumentsArgs,
    instrumentId: number
  ) {
    const fullProposals = await this.proposalDataSource.getProposalsByIds(
      inputArguments.proposalPks
    );

    const allProposalsCallIds = fullProposals.map(
      (fullProposal) => fullProposal.callId
    );

    const proposalCallsWithInstrument =
      await this.dataSource.getCallsByInstrumentId(
        instrumentId,
        allProposalsCallIds
      );

    const proposalsOnSameCallAsInstrument = fullProposals.filter((proposal) =>
      proposalCallsWithInstrument.some(
        (call) => call.callId === proposal.callId
      )
    );

    return (
      proposalsOnSameCallAsInstrument.length ===
      inputArguments.proposalPks.length
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToInstruments(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentsArgs
  ): Promise<InstrumentHasProposals | Rejection> {
    return this.assignProposalsToInstrumentsInternal(agent, args);
  }

  @EventBus(Event.PROPOSAL_INSTRUMENT_SELECTED)
  async assignProposalsToInstrumentsInternal(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentsArgs
  ): Promise<InstrumentHasProposals | Rejection> {
    let result: InstrumentHasProposals | Rejection = rejection(
      'Could not assign proposal/s to instrument',
      {
        agent,
        args,
      }
    );
    // TODO: Cleanup this part because it is quite ugly
    for await (const instrumentId of args.instrumentIds) {
      const allProposalsAreOnSameCallAsInstrument =
        await this.checkIfProposalsAreOnSameCallAsInstrument(
          args,
          instrumentId
        );

      if (!allProposalsAreOnSameCallAsInstrument) {
        return rejection(
          'One or more proposals can not be assigned to instrument, because instrument is not in the call',
          { args }
        );
      }

      const instrument = await this.dataSource.getInstrument(instrumentId);

      if (!instrument) {
        return rejection(
          'Cannot assign the proposal to the instrument because the proposals call has no such instrument',
          { agent, args }
        );
      }

      for await (const proposalPk of args.proposalPks) {
        const technicalReview =
          await this.reviewDataSource.getProposalInstrumentTechnicalReview(
            proposalPk,
            instrumentId
          );

        if (technicalReview) {
          await this.proposalDataSource.updateProposalTechnicalReviewer({
            userId: instrument.managerUserId,
            proposalPks: [proposalPk],
            instrumentId: instrument.id,
          });
        } else {
          await this.reviewDataSource.setTechnicalReview(
            {
              proposalPk: proposalPk,
              comment: null,
              publicComment: null,
              reviewerId: instrument.managerUserId,
              timeAllocation: null,
              status: null,
              files: null,
              submitted: false,
              instrumentId: instrument.id,
            },
            false
          );
          await this.proposalDataSource.updateProposalTechnicalReviewer({
            userId: instrument.managerUserId,
            proposalPks: [proposalPk],
            instrumentId: instrument.id,
          });
        }
      }

      result = await this.dataSource.assignProposalsToInstrument(
        args.proposalPks,
        instrumentId
      );

      if (result.proposalPks.length !== args.proposalPks.length) {
        return rejection('Could not assign proposal/s to instrument', {
          agent,
          args,
        });
      }
    }

    return result;
  }

  @Authorized([Roles.USER_OFFICER])
  async removeProposalsFromInstrument(
    agent: UserWithRole | null,
    args: RemoveProposalsFromInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeProposalsFromInstrument(args.proposalPks)
      .catch((error) => {
        return rejection(
          'Could not remove assigned proposal/s from instrument',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(assignScientistsToInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignScientistsToInstrument(
    agent: UserWithRole | null,
    args: AssignScientistsToInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignScientistsToInstrument(args.scientistIds, args.instrumentId)
      .catch((error) => {
        return rejection(
          'Could not assign scientist/s to instrument',
          { agent, args },
          error
        );
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
      .catch((error) => {
        return rejection(
          'Could not remove assigned scientist/s from instrument',
          { agent, args },
          error
        );
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
      .catch((error) => {
        return rejection(
          'Could not set availability time on instrument',
          { agent, args },
          error
        );
      });
  }

  @EventBus(Event.PROPOSAL_INSTRUMENT_SUBMITTED)
  @ValidateArgs(submitInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async submitInstrument(
    agent: UserWithRole | null,
    args: InstrumentSubmitArgs
  ): Promise<InstrumentHasProposals | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, args.fapId))
    ) {
      return rejection('Submitting instrument is not permitted', {
        code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS,
        agent,
        args,
      });
    }

    const allInstrumentProposals =
      await this.fapDataSource.getFapProposalsByInstrument(
        args.fapId,
        args.instrumentId,
        args.callId
      );

    const submittedInstrumentProposalPks = allInstrumentProposals.map(
      (fapInstrumentProposal) => fapInstrumentProposal.proposalPk
    );

    const fapProposalsWithReviewsAndRanking =
      await this.fapDataSource.getFapProposalsWithReviewGradesAndRanking(
        submittedInstrumentProposalPks
      );

    const allFapMeetingsHasRankings = fapProposalsWithReviewsAndRanking.every(
      (fapProposalWithReviewsAndRanking) =>
        !!fapProposalWithReviewsAndRanking.rankOrder
    );

    if (!allFapMeetingsHasRankings) {
      const sortedFapProposals = sortByRankOrAverageScore(
        fapProposalsWithReviewsAndRanking
      );

      const allProposalsWithRankings = sortedFapProposals.map(
        (sortedFapProposal, index) => {
          if (!sortedFapProposal.rankOrder) {
            sortedFapProposal.rankOrder = index + 1;
          }

          return sortedFapProposal;
        }
      );

      await Promise.all(
        allProposalsWithRankings.map((proposalWithRanking) => {
          return this.fapDataSource.saveFapMeetingDecision({
            proposalPk: proposalWithRanking.proposalPk,
            rankOrder: proposalWithRanking.rankOrder,
          });
        })
      );
    }

    return this.dataSource
      .submitInstrument(submittedInstrumentProposalPks, args.instrumentId)
      .catch((error) => {
        return rejection('Could not submit instrument', { agent, args }, error);
      });
  }
}
