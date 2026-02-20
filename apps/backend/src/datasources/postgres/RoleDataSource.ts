import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Role } from '../../models/Role';
import { Tag } from '../../models/Tag';
import { RoleDataSource } from '../RoleDataSource';
import database from './database';
import { createRoleObject, createTagObject } from './records';

@injectable()
export default class PostgresRoleDataSource implements RoleDataSource {
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
