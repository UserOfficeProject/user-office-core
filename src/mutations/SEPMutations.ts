import { logger } from '@esss-swap/duo-logger';
import {
  createSEPValidationSchema,
  updateSEPValidationSchema,
  assignSEPMembersValidationSchema,
  removeSEPMemberValidationSchema,
  assignProposalToSEPValidationSchema,
  assignSEPChairOrSecretaryValidationSchema,
  assignSEPMemberToProposalValidationSchema,
  updateTimeAllocationValidationSchema,
} from '@esss-swap/duo-validation';

import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { ProposalIdsWithNextStatus } from '../models/Proposal';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { UserWithRole, UserRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import {
  UpdateMemberSEPArgs,
  AssignSepReviewersToProposalArgs,
  AssignReviewersToSEPArgs,
  RemoveSepReviewerFromProposalArgs,
  AssignChairOrSecretaryToSEPArgs,
} from '../resolvers/mutations/AssignMembersToSEP';
import { AssignProposalToSEPArgs } from '../resolvers/mutations/AssignProposalToSEP';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { UpdateSEPTimeAllocationArgs } from '../resolvers/mutations/UpdateSEPProposalMutation';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SEPMutations {
  constructor(
    private dataSource: SEPDataSource,
    private instrumentDataSource: InstrumentDataSource,
    private userAuth: UserAuthorization
  ) {}

  @ValidateArgs(createSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .create(
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.active
      )
      .then(sep => sep)
      .catch(err => {
        logger.logException(
          'Could not create scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .update(
        args.id,
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.active
      )
      .then(sep => sep)
      .catch(err => {
        logger.logException(
          'Could not update scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPChairOrSecretaryValidationSchema(UserRole))
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignChairOrSecretaryToSEP(
    agent: UserWithRole | null,
    args: AssignChairOrSecretaryToSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .assignChairOrSecretaryToSEP(args.assignChairOrSecretaryToSEPInput)
      .then(result => result)
      .catch(err => {
        logger.logException(
          'Could not assign chair and secretary to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPMembersValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignReviewersToSEP(
    agent: UserWithRole | null,
    args: AssignReviewersToSEPArgs
  ): Promise<SEP | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, args.sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .assignReviewersToSEP(args)
      .then(result => result)
      .catch(err => {
        logger.logException(
          'Could not assign member to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(removeSEPMemberValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_REMOVED)
  async removeMemberFromSEP(
    agent: UserWithRole | null,
    args: UpdateMemberSEPArgs
  ): Promise<SEP | Rejection> {
    const isChairOrSecretaryOfSEP = await this.userAuth.isChairOrSecretaryOfSEP(
      agent!.id,
      args.sepId
    );
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);

    if (!isUserOfficer && !isChairOrSecretaryOfSEP) {
      return rejection('NOT_ALLOWED');
    }

    const isMemberChairOrSecretaryOfSEP = await this.userAuth.isChairOrSecretaryOfSEP(
      args.memberId,
      args.sepId
    );

    // SEP Chair and SEP Secretary can not
    // modify SEP Chair and SEP Secretary members
    if (isChairOrSecretaryOfSEP && !isUserOfficer) {
      if (isMemberChairOrSecretaryOfSEP) {
        return rejection('NOT_ALLOWED');
      }
    }

    return this.dataSource
      .removeMemberFromSEP(args, isMemberChairOrSecretaryOfSEP)
      .then(result => result)
      .catch(err => {
        logger.logException(
          'Could not remove member from scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignProposalToSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_SEP_SELECTED)
  async assignProposalToSEP(
    agent: UserWithRole | null,
    args: AssignProposalToSEPArgs
  ): Promise<ProposalIdsWithNextStatus | Rejection> {
    return this.dataSource
      .assignProposal(args.proposalId, args.sepId)
      .then(async result => {
        const nextProposalStatus = await this.dataSource.getProposalNextStatus(
          args.proposalId,
          Event.PROPOSAL_SEP_SELECTED
        );

        return new ProposalIdsWithNextStatus(
          result.proposalIds,
          nextProposalStatus?.id,
          nextProposalStatus?.shortCode,
          nextProposalStatus?.name
        );
      })
      .catch(err => {
        logger.logException(
          'Could not assign proposal to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignProposalToSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_PROPOSAL_REMOVED)
  async removeProposalAssignment(
    agent: UserWithRole | null,
    args: AssignProposalToSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .removeProposalAssignment(args.proposalId, args.sepId)
      .then(result => result)
      .catch(err => {
        logger.logException(
          'Could not remove assigned proposal from scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_ASSIGNED_TO_PROPOSAL)
  async assignSepReviewersToProposal(
    agent: UserWithRole | null,
    args: AssignSepReviewersToProposalArgs
  ): Promise<SEP | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, args.sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .assignMemberToSEPProposal(args.proposalId, args.sepId, args.memberIds)
      .then(result => result)
      .catch(err => {
        logger.logException(
          'Could not assign proposal to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPMemberToProposalValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_REMOVED_FROM_PROPOSAL)
  async removeMemberFromSepProposal(
    agent: UserWithRole | null,
    args: RemoveSepReviewerFromProposalArgs
  ): Promise<SEP | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(
        (agent as UserWithRole).id,
        args.sepId
      ))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .removeMemberFromSepProposal(args.proposalId, args.sepId, args.memberId)
      .then(result => result)
      .catch(err => {
        logger.logException('Could not remove member from SEP proposal', err, {
          agent,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateTimeAllocationValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async updateTimeAllocation(
    agent: UserWithRole | null,
    { sepId, proposalId, sepTimeAllocation = null }: UpdateSEPTimeAllocationArgs
  ) {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (
      !isUserOfficer &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    const isProposalInstrumentSubmitted = await this.instrumentDataSource.isProposalInstrumentSubmitted(
      proposalId
    );

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .updateTimeAllocation(sepId, proposalId, sepTimeAllocation)
      .catch(err => {
        logger.logException(
          'Could not update SEP proposal time allocation',
          err,
          {
            agent,
            sepId,
            proposalId,
            sepTimeAllocation,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }
}
