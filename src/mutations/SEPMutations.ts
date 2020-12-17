import {
  createSEPValidationSchema,
  updateSEPValidationSchema,
  assignSEPMembersValidationSchema,
  removeSEPMemberValidationSchema,
  assignProposalToSEPValidationSchema,
  assignSEPChairOrSecretaryValidationSchema,
  assignSEPMemberToProposalValidationSchema,
} from '@esss-swap/duo-validation';

import { SEPDataSource } from '../datasources/SEPDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { ProposalIds } from '../models/Proposal';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { UserRole, UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddSEPMembersRoleArgs } from '../resolvers/mutations/AddSEPMembersRoleMutation';
import {
  UpdateMemberSEPArgs,
  AssignSEPProposalToMemberArgs,
  AssignMembersSEPArgs,
} from '../resolvers/mutations/AssignMembersToSEP';
import { AssignProposalToSEPArgs } from '../resolvers/mutations/AssignProposalToSEP';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SEPMutations {
  constructor(
    private dataSource: SEPDataSource,
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
    args: AddSEPMembersRoleArgs
  ): Promise<SEP | Rejection> {
    const allSEPMembers = await this.dataSource.getMembers(
      args.addSEPMembersRole.SEPID
    );

    const [existingChairOrSecretary] = allSEPMembers.filter(
      member =>
        member.roleId === args.addSEPMembersRole.roleID &&
        member.sepId === args.addSEPMembersRole.SEPID
    );

    if (existingChairOrSecretary) {
      await this.dataSource.removeSEPMemberRole({
        memberId: existingChairOrSecretary.userId,
        sepId: existingChairOrSecretary.sepId,
        roleId: existingChairOrSecretary.roleId,
      });
    }

    return this.dataSource
      .addSEPMembersRole(args.addSEPMembersRole)
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
  async assignMemberToSEP(
    agent: UserWithRole | null,
    args: AssignMembersSEPArgs
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
      .addSEPMembersRole({
        userIDs: args.memberIds,
        SEPID: args.sepId,
        roleID: UserRole.SEP_REVIEWER,
      })
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
      .removeSEPMemberRole(args)
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
  ): Promise<ProposalIds | Rejection> {
    return this.dataSource
      .assignProposal(args.proposalId, args.sepId)
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
          'Could not assign proposal to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPMemberToProposalValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_ASSIGNED_TO_PROPOSAL)
  async assignMemberToSEPProposal(
    agent: UserWithRole | null,
    args: AssignSEPProposalToMemberArgs
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
      .assignMemberToSEPProposal(args.proposalId, args.sepId, args.memberId)
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
    args: AssignSEPProposalToMemberArgs
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
}
