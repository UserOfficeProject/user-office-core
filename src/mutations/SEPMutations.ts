import * as yup from 'yup';

import { SEPDataSource } from '../datasources/SEPDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { User, UserRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddSEPMembersRoleArgs } from '../resolvers/mutations/AddSEPMembersRoleMutation';
import {
  UpdateMemberSEPArgs,
  AssignSEPProposalToMemberArgs,
} from '../resolvers/mutations/AssignMembersToSEP';
import { AssignProposalToSEPArgs } from '../resolvers/mutations/AssignProposalToSEP';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

const createSEPValidationSchema = yup.object().shape({
  code: yup.string().required(),
  description: yup.string().required(),
  numberRatingsRequired: yup.number().min(2),
});

const updateSEPValidationSchema = yup.object().shape({
  id: yup.number().required(),
  code: yup.string().required(),
  description: yup.string().required(),
  numberRatingsRequired: yup.number().min(2),
});

const assignSEPChairAndSecretaryValidationSchema = yup.object().shape({
  addSEPMembersRole: yup
    .array()
    .of(
      yup.object().shape({
        userID: yup.number().required(),
        roleID: yup
          .number()
          .oneOf([UserRole.SEP_CHAIR, UserRole.SEP_SECRETARY])
          .required(),
        SEPID: yup.number().required(),
      })
    )
    .required()
    .min(2),
});

const updateSEPMemberValidationSchema = yup.object().shape({
  memberId: yup.number().required(),
  sepId: yup.number().required(),
});

const assignProposalToSEPValidationSchema = yup.object().shape({
  proposalId: yup.number().required(),
  sepId: yup.number().required(),
});

const assignSEPMemberToProposalValidationSchema = yup.object().shape({
  proposalId: yup.number().required(),
  sepId: yup.number().required(),
  memberId: yup.number().required(),
});

export default class SEPMutations {
  constructor(
    private dataSource: SEPDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(createSEPValidationSchema)
  @EventBus(Event.SEP_CREATED)
  async create(
    agent: User | null,
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

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(updateSEPValidationSchema)
  @EventBus(Event.SEP_UPDATED)
  async update(
    agent: User | null,
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

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(assignSEPChairAndSecretaryValidationSchema)
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignChairAndSecretaryToSEP(
    agent: User | null,
    args: AddSEPMembersRoleArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .addSEPMembersRoles(args.addSEPMembersRole)
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

  async isChairOrSecretaryOfSEP(
    userId: number,
    sepId: number
  ): Promise<boolean> {
    if (!userId || !sepId) {
      return false;
    }

    return this.dataSource.getSEPUserRoles(userId, sepId).then(roles => {
      return roles.some(
        role =>
          role.id === UserRole.SEP_CHAIR || role.id === UserRole.SEP_SECRETARY
      );
    });
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @ValidateArgs(updateSEPMemberValidationSchema)
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignMemberToSEP(
    agent: User | null,
    args: UpdateMemberSEPArgs
  ): Promise<SEP | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.isChairOrSecretaryOfSEP((agent as User).id, args.sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .addSEPMembersRoles([
        {
          userID: args.memberId,
          SEPID: args.sepId,
          roleID: UserRole.SEP_MEMBER,
        },
      ])
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

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @ValidateArgs(updateSEPMemberValidationSchema)
  @EventBus(Event.SEP_MEMBER_REMOVED)
  async removeMemberFromSEP(
    agent: User | null,
    args: UpdateMemberSEPArgs
  ): Promise<SEP | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.isChairOrSecretaryOfSEP((agent as User).id, args.sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .removeSEPMemberRole(args.memberId, args.sepId)
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

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(assignProposalToSEPValidationSchema)
  @EventBus(Event.SEP_PROPOSAL_ASSIGNED)
  async assignProposalToSEP(
    agent: User | null,
    args: AssignProposalToSEPArgs
  ): Promise<SEP | Rejection> {
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

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(assignProposalToSEPValidationSchema)
  @EventBus(Event.SEP_PROPOSAL_REMOVED)
  async removeProposalAssignment(
    agent: User | null,
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

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @ValidateArgs(assignSEPMemberToProposalValidationSchema)
  @EventBus(Event.SEP_MEMBER_TO_PROPOSAL_ASSIGNED)
  async assignMemberToSEPProposal(
    agent: User | null,
    args: AssignSEPProposalToMemberArgs
  ): Promise<SEP | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.isChairOrSecretaryOfSEP((agent as User).id, args.sepId))
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
}
