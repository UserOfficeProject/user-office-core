import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Tag } from '../../models/Tag';
import { RoleDataSource } from '../RoleDataSource';
import database from './database';
import { createTagObject } from './records';

@injectable()
export default class PostgresRoleDataSource implements RoleDataSource {
  async addTagToRole(roleId: number, tagId: number): Promise<void> {
    try {
      const roleExists = await database('roles')
        .where('role_id', roleId)
        .first();

      if (!roleExists) {
        throw new GraphQLError(`Role with id ${roleId} not found`);
      }

      const tagExists = await database('tag').where('tag_id', tagId).first();

      if (!tagExists) {
        throw new GraphQLError(`Tag with id ${tagId} not found`);
      }

      await database('roles_has_tags')
        .insert({ role_id: roleId, tag_id: tagId })
        .onConflict(['role_id', 'tag_id'])
        .ignore();
    } catch (error) {
      logger.logError('Failed to add tag to role', {
        roleId,
        tagId,
      });
      throw error;
    }
  }

  async removeTagFromRole(roleId: number, tagId: number): Promise<void> {
    try {
      await database('roles_has_tags')
        .where('role_id', roleId)
        .andWhere('tag_id', tagId)
        .del();
    } catch (error) {
      logger.logError('Failed to remove tag from role', {
        roleId,
        tagId,
      });
      throw new GraphQLError('Failed to remove tag from role');
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
