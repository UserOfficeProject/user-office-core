import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import database from './database';
import { RoleRecord, createRoleObject, createTagObject } from './records';
import { Role, Roles } from '../../models/Role';
import { Tag } from '../../models/Tag';
import { CreateRoleArgs } from '../../resolvers/mutations/CreateRoleMutation';
import { RoleConfigInput } from '../../resolvers/mutations/RoleConfigInput';
import { UpdateRoleArgs } from '../../resolvers/mutations/UpdateRoleMutation';
import { RoleDataSource } from '../RoleDataSource';

function defaultConfig(shortCode: string): unknown {
  switch (shortCode) {
    case Roles.USER:
      return { note: '' };
    case Roles.PROPOSAL_READER:
      return {
        hasLogAccess: true,
        hasTechnicalReviewAccess: true,
        hasFapAccess: true,
        hasAdminAccess: false,
      };
    default:
      return { note: '' };
  }
}

function resolveConfig(shortCode: string, config: RoleConfigInput | undefined) {
  if (!config) return defaultConfig(shortCode);

  switch (shortCode) {
    case Roles.USER:
      return config.user;
    case Roles.PROPOSAL_READER:
      return config.proposalReader;
    default:
      return defaultConfig(shortCode);
  }
}

@injectable()
export default class PostgresRoleDataSource implements RoleDataSource {
  async createRole(args: CreateRoleArgs): Promise<Role> {
    const { shortCode, title, description, config } = args;

    const [roleRecord] = await database
      .insert({
        short_code: shortCode,
        title,
        description,
        config: resolveConfig(shortCode, config),
        is_root_role: false,
      })
      .into('roles')
      .returning<RoleRecord[]>('*');

    return createRoleObject(roleRecord);
  }

  async updateRole(args: UpdateRoleArgs): Promise<Role> {
    const { roleID, shortCode, title, description, config } = args;

    const [roleRecord] = await database
      .update({
        title,
        description,
        config: config ? resolveConfig(shortCode, config) : undefined,
      })
      .from('roles')
      .where('role_id', roleID)
      .returning('*');

    return createRoleObject(roleRecord);
  }

  async deleteRole(id: number): Promise<Role> {
    const [deletedRole] = await database('roles')
      .where('role_id', id)
      .del()
      .returning('*');

    if (!deletedRole) {
      throw new GraphQLError(`Role with id ${id} not found`);
    }

    return createRoleObject(deletedRole);
  }

  async updateRoleTags(roleId: number, tagIds: number[]): Promise<Role> {
    const roleExists = await database('roles').where('role_id', roleId).first();

    if (!roleExists) {
      throw new GraphQLError(`Role with id ${roleId} not found`);
    }

    if (tagIds.length > 0) {
      const tagsExist = await database('tag').whereIn('tag_id', tagIds);

      if (tagsExist.length !== tagIds.length) {
        throw new GraphQLError('One or more tags not found');
      }
    }

    try {
      await database.transaction(async (trx) => {
        await trx('roles_has_tags').where('role_id', roleId).del();

        if (tagIds.length > 0) {
          await trx('roles_has_tags').insert(
            tagIds.map((tagId) => ({ role_id: roleId, tag_id: tagId }))
          );
        }
      });

      return createRoleObject(roleExists);
    } catch (error) {
      logger.logError('Failed to set tags for role', {
        roleId,
        tagIds,
      });
      throw error;
    }
  }

  async getTagsByRoleId(roleId: number): Promise<Tag[]> {
    try {
      const rows = await database
        .select('t.tag_id', 't.name')
        .from('roles_has_tags as rht')
        .join('tag as t', 't.tag_id', 'rht.tag_id')
        .where('rht.role_id', roleId);

      return rows.map(createTagObject);
    } catch (error) {
      logger.logError('Failed to get tags by role id', {
        roleId,
      });
      throw error;
    }
  }
}
