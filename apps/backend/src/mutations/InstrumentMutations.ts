import { logger } from '@user-office-software/duo-logger';
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
import { CallDataSource } from '../datasources/CallDataSource';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { TechniqueDataSource } from '../datasources/TechniqueDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Experiment, ExperimentStatus } from '../models/Experiment';
import { Instrument, InstrumentsHasProposals } from '../models/Instrument';
import { rejection, Rejection, isRejection } from '../models/Rejection';
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
  InstrumentSubmitInFapArgs,
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
    @inject(Tokens.StatusDataSource)
    private statusDataSource: StatusDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TechniqueDataSource)
    private techniqueDataSource: TechniqueDataSource,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
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
    try {
      const currentInstrument = await this.dataSource.getInstrument(args.id);

      if (!currentInstrument) {
        return rejection('Instrument not found', { instrumentId: args.id });
      }

      if (
        args.managerUserId &&
        args.managerUserId !== currentInstrument.managerUserId &&
        args.updateTechReview
      ) {
        const updateSuccess =
          await this.reviewDataSource.updateInstrumentContact(
            args.managerUserId,
            currentInstrument.id
          );

        if (!updateSuccess) {
          return rejection('Failed to update contact ', {
            instrumentId: currentInstrument.id,
            managerUserId: args.managerUserId,
          });
        }
      }

      return await this.dataSource.update(args);
    } catch (error) {
      logger.logError('Error updating instrument:', {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });

      return rejection(
        'Could not update instrument',
        { agent, instrumentId: args.id },
        error
      );
    }
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
    const fullProposals = await this.proposalDataSource.getProposalsByPks(
      inputArguments.proposalPks
    );

    const proposalsUniqueCallIds = fullProposals
      .map((fullProposal) => fullProposal.callId)
      .filter((proposal, index, array) => array.indexOf(proposal) === index);

    const proposalCallsWithInstrument =
      await this.dataSource.getCallsByInstrumentId(
        instrumentId,
        proposalsUniqueCallIds
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
  ): Promise<InstrumentsHasProposals | Rejection> {
    return this.assignProposalsToInstrumentsInternal(agent, args);
  }

  @EventBus(Event.PROPOSAL_INSTRUMENTS_SELECTED)
  async assignProposalsToInstrumentsInternal(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentsArgs
  ): Promise<InstrumentsHasProposals | Rejection> {
    let result: InstrumentsHasProposals | Rejection = rejection(
      'Could not assign proposal/s to instrument',
      {
        agent,
        args,
      }
    );

    const instrumentHasProposalIds: number[] = [];

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
        const instrumentHasProposalId = await this.assignProposalToInstrument(
          agent,
          proposalPk,
          instrument,
          args
        );

        if (isRejection(instrumentHasProposalId)) {
          return instrumentHasProposalId;
        }

        if (instrumentHasProposalId !== null) {
          instrumentHasProposalIds.push(instrumentHasProposalId);
        }
      }
    }

    result = new InstrumentsHasProposals(
      instrumentHasProposalIds,
      args.instrumentIds,
      args.proposalPks,
      false
    );

    return result;
  }

  /**
   * Assigns a single proposal to an instrument, removing it from any
   * instruments that are not part of the requested set, and sets up the
   * technical review if the proposal requires one.
   * Resolves to the new instrument_has_proposals id, or null when the
   * proposal was already assigned to the instrument.
   */
  private async assignProposalToInstrument(
    agent: UserWithRole | null,
    proposalPk: number,
    instrument: Instrument,
    args: AssignProposalsToInstrumentsArgs
  ): Promise<number | null | Rejection> {
    // All instruments currently on the proposal
    const proposalInstruments =
      await this.dataSource.getInstrumentsByProposalPk(proposalPk);

    // Instruments on the proposal that are not part of the requested set
    const proposalInstrumentsToRemove = proposalInstruments.filter(
      (i) => !args.instrumentIds.includes(i.id)
    );

    if (proposalInstrumentsToRemove.length) {
      await Promise.all(
        proposalInstrumentsToRemove.map((i) => {
          return this.dataSource.removeProposalsFromInstrument(
            [proposalPk],
            i.id
          );
        })
      );
    }

    // Already assigned to this instrument: nothing to do
    if (proposalInstruments.find((i) => i.id === instrument.id)) {
      return null;
    }

    const {
      instrumentHasProposalIds: [instrumentHasProposalId],
    } = await this.dataSource.assignProposalToInstrument(
      proposalPk,
      instrument.id
    );

    const needTechReview =
      await this.proposalDataSource.doesProposalNeedTechReview(proposalPk);

    if (!needTechReview) {
      return instrumentHasProposalId;
    }

    const technicalReview =
      await this.reviewDataSource.getProposalInstrumentTechnicalReview(
        proposalPk,
        instrument.id
      );

    if (technicalReview) {
      await this.proposalDataSource.updateProposalTechnicalReviewer({
        userId: instrument.managerUserId,
        proposalPks: [proposalPk],
        instrumentId: instrument.id,
      });

      return instrumentHasProposalId;
    }

    const proposal = await this.proposalDataSource.get(proposalPk);

    if (!proposal) {
      return rejection(
        'Cannot find the proposal for the technical review to be created',
        { agent, args }
      );
    }

    const call = await this.callDataSource.getCall(proposal.callId);

    if (!call) {
      return rejection(
        'Cannot find the call for proposal of the technical review to be created',
        { agent, args }
      );
    }

    const technicalReviewQuestionary = await this.questionaryDataSource.create(
      proposal.proposerId,
      call.technicalReviewTemplateId
    );

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
        questionaryId: technicalReviewQuestionary.questionaryId,
      },
      false
    );
    await this.proposalDataSource.updateProposalTechnicalReviewer({
      userId: instrument.managerUserId,
      proposalPks: [proposalPk],
      instrumentId: instrument.id,
    });

    return instrumentHasProposalId;
  }

  /**
   * Creates a placeholder experiment for a technique proposal that has been
   * assigned to an instrument. It mirrors the experiment created by the
   * message broker for the PROPOSAL_BOOKING_TIME_SLOT_ADDED event, but the
   * time slot is not scheduled yet: startsAt defaults to the current date
   * and endsAt stays null until a time slot is booked in the scheduler.
   */
  private async createTechniqueExperiment(
    agent: UserWithRole | null,
    proposalPk: number,
    instrument: Instrument,
    startsAt: Date | null
  ): Promise<Rejection | void> {
    try {
      const experimentToAdd = {
        startsAt: startsAt ?? new Date(),
        endsAt: null,
        // There is no scheduler booking yet, so there is no scheduled event.
        scheduledEventId: 0,
        proposalPk,
        status: ExperimentStatus.DRAFT,
        localContactId: null,
        instrumentId: instrument.id,
      } as Omit<
        Experiment,
        'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
      >;

      await this.experimentDataSource.create(experimentToAdd);
    } catch (error) {
      logger.logException(
        `Error while creating experiment for technique proposal ${proposalPk} on instrument ${instrument.id}`,
        error
      );

      return rejection(
        'Could not create experiment for the assigned technique proposal',
        { agent, proposalPk, instrumentId: instrument.id },
        error
      );
    }
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

  @EventBus(Event.PROPOSAL_FAP_MEETING_INSTRUMENT_SUBMITTED)
  @ValidateArgs(submitInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async submitInstrumentInFap(
    agent: UserWithRole | null,
    args: InstrumentSubmitInFapArgs
  ): Promise<InstrumentsHasProposals | Rejection> {
    if (
      !this.userAuth.isApiToken(agent) &&
      !this.userAuth.isUserOfficer(agent)
    ) {
      return rejection('Submitting FAP instrument is not permitted', {
        code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS,
        agent,
        args,
      });
    }

    const allInstrumentProposals =
      await this.fapDataSource.getFapProposalsByInstrument(
        args.instrumentId,
        args.callId,
        { fapId: args.fapId }
      );

    const submittedFapInstrumentProposalPks = allInstrumentProposals.map(
      (fapInstrumentProposal) => fapInstrumentProposal.proposalPk
    );

    const fapProposalsWithReviewsAndRanking =
      await this.fapDataSource.getFapProposalsWithReviewGradesAndRanking(
        submittedFapInstrumentProposalPks
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
            instrumentId: args.instrumentId,
            fapId: args.fapId,
          });
        })
      );
    }

    return this.dataSource
      .submitInstrumentInFap(
        submittedFapInstrumentProposalPks,
        args.instrumentId
      )
      .catch((error) => {
        return rejection(
          'Could not submit instrument in FAP',
          { agent, args },
          error
        );
      });
  }

  @EventBus(Event.PROPOSAL_FAP_MEETING_INSTRUMENT_UNSUBMITTED)
  @Authorized([Roles.USER_OFFICER])
  async unsubmitInstrumentInFap(
    agent: UserWithRole | null,
    args: InstrumentSubmitInFapArgs
  ): Promise<InstrumentsHasProposals | Rejection> {
    if (
      !this.userAuth.isApiToken(agent) &&
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, args.fapId))
    ) {
      return rejection('Unsubmitting instrument in FAP is not permitted', {
        code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS,
        agent,
        args,
      });
    }

    const allInstrumentProposals =
      await this.fapDataSource.getFapProposalsByInstrument(
        args.instrumentId,
        args.callId,
        { fapId: args.fapId }
      );

    const proposalPksToUnsubmit = allInstrumentProposals.map(
      (fapInstrumentProposal) => fapInstrumentProposal.proposalPk
    );

    return this.dataSource
      .unsubmitInstrumentInFap(proposalPksToUnsubmit, args.instrumentId)
      .catch((error) => {
        return rejection(
          'Could not unsubmit instrument in FAP',
          { agent, args },
          error
        );
      });
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async assignTechniqueProposalsToInstruments(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentsArgs
  ): Promise<InstrumentsHasProposals | Rejection> {
    /*
    If the user is not a User Officer, ensure
    the status is currently Under Review.
    */
    const isUserOfficerOrApiToken =
      agent?.currentRole?.shortCode === Roles.USER_OFFICER ||
      agent?.isApiAccessToken;

    if (!isUserOfficerOrApiToken) {
      const proposal = await this.proposalDataSource.get(args.proposalPks[0]);

      if (!proposal) {
        return rejection(
          'Could not assign instrument: failed to retrieve proposal',
          {
            agent,
            args,
          }
        );
      }

      const proposalStatus =
        await this.statusDataSource.getStatusByWorkflowStatusId(
          proposal.workflowStatusId
        );
      if (proposalStatus?.id !== 'UNDER_REVIEW') {
        return rejection(
          'Could not assign instrument: forbidden current status',
          {
            agent,
            args,
            currentStatus: proposalStatus?.id,
          }
        );
      }
    }

    /*
    Ensure the instruments to be assigned belong
    to the technique of the proposal.
    */
    const techniquesWithProposal =
      await this.techniqueDataSource.getTechniquesByProposalPk(
        args.proposalPks[0]
      );

    if (!techniquesWithProposal || techniquesWithProposal.length < 1) {
      return rejection(
        'Could not assign instrument: failed to retrieve proposal techniques',
        {
          agent,
          args,
        }
      );
    }

    const instrumentWithTechnique =
      await this.techniqueDataSource.getInstrumentsByTechniqueIds(
        techniquesWithProposal.map((technique) => technique.id)
      );

    const isTechniqueProposal = instrumentWithTechnique.find(
      (instruments) => instruments.id === args.instrumentIds[0]
    )
      ? true
      : false;

    if (!isTechniqueProposal) {
      return rejection(
        'Could not assign instrument: instrument does not belong to proposal techniques',
        {
          agent,
          args,
        }
      );
    }

    // Create a placeholder experiment for every proposal being assigned to
    // the instrument. No time slot is scheduled yet, so startsAt defaults
    // to the current date and endsAt stays null until a slot is booked.
    const experimentInstrument = await this.dataSource.getInstrument(
      args.instrumentIds[0]
    );

    if (!experimentInstrument) {
      return rejection('Instrument not found', { agent, args });
    }

    for (const proposalPk of args.proposalPks) {
      const experimentResult = await this.createTechniqueExperiment(
        agent,
        proposalPk,
        experimentInstrument,
        null
      );

      if (experimentResult) {
        return experimentResult;
      }
    }

    return this.assignProposalsToInstrumentsInternal(agent, args);
  }
}
