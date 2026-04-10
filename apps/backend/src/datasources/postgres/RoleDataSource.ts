import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Role } from '../../models/Role';
import { Tag } from '../../models/Tag';
import { CreateRoleArgs } from '../../resolvers/mutations/CreateRoleMutation';
import { UpdateRoleArgs } from '../../resolvers/mutations/UpdateRoleMutation';
import { RoleDataSource } from '../RoleDataSource';
import database from './database';
import { RoleRecord, createRoleObject, createTagObject } from './records';

@injectable()
export default class PostgresRoleDataSource implements RoleDataSource {
  private toPostgresArray(array: string[]): string {
    return `{${array.map((item) => `"${item}"`).join(',')}}`;
  }

  async createRole(args: CreateRoleArgs): Promise<Role> {
    const { shortCode, title, description, permissions } = args;

    const postgresPermissions = Array.isArray(permissions)
      ? this.toPostgresArray(permissions)
      : permissions;

    const [roleRecord] = await database
      .insert({
        short_code: shortCode,
        title,
        description,
        permissions: postgresPermissions,
        is_root_role: false,
      })
      .into('roles')
      .returning<RoleRecord[]>('*');

    return new Role(
      roleRecord.role_id,
      roleRecord.short_code,
      roleRecord.title,
      roleRecord.description,
      roleRecord.permissions,
      roleRecord.is_root_role
    );
  }

  async updateRole(args: UpdateRoleArgs): Promise<Role> {
    const { roleID, title, description, permissions } = args;

    const postgresPermissions = Array.isArray(permissions)
      ? this.toPostgresArray(permissions)
      : permissions;

    const [roleRecord] = await database
      .update({
        title,
        description,
        permissions: postgresPermissions,
      })
      .from('roles')
      .where('role_id', roleID)
      .returning('*');

    return new Role(
      roleRecord.role_id,
      roleRecord.short_code,
      roleRecord.title,
      roleRecord.description,
      roleRecord.permissions,
      roleRecord.isRootRole
    );
  }

  async deleteRole(id: number): Promise<Role> {
    const [deletedRole] = await database('roles')
      .where('role_id', id)
      .del()
      .returning('*');

    if (!deletedRole) {
      throw new GraphQLError(`Role with id ${id} not found`);
    }

    return new Role(
      deletedRole.role_id,
      deletedRole.short_code,
      deletedRole.title,
      deletedRole.description,
      deletedRole.permissions,
      deletedRole.data_access
    );
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
