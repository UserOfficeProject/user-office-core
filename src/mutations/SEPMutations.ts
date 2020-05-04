import * as yup from 'yup';

import { SEPDataSource } from '../datasources/SEPDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { User, UserRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddSEPMembersRoleArgs } from '../resolvers/mutations/AddSEPMembersRoleMutation';
import { UpdateMemberSEPArgs } from '../resolvers/mutations/AssignMembersToSEP';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { logger } from '../utils/Logger';

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
    .required()
    .min(2),
});

const updateSEPMemberValidationSchema = yup.object().shape({
  memberId: yup.number().required(),
  sepId: yup.number().required(),
});

export default class SEPMutations {
  constructor(private dataSource: SEPDataSource) {}

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
  async assignChairAndSecretary(
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

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @ValidateArgs(updateSEPMemberValidationSchema)
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignMember(
    agent: User | null,
    args: UpdateMemberSEPArgs
  ): Promise<SEP | Rejection> {
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

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(updateSEPMemberValidationSchema)
  @EventBus(Event.SEP_MEMBER_REMOVED)
  async removeMember(
    agent: User | null,
    args: UpdateMemberSEPArgs
  ): Promise<SEP | Rejection> {
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
}
