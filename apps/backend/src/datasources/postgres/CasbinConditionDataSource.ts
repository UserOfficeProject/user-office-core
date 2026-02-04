import { injectable } from 'tsyringe';

import {
  CasbinCondition,
  CasbinConditionDataSource,
} from '../CasbinConditionDataSource';
import database from './database';

@injectable()
export default class PostgresCasbinConditionDataSource
  implements CasbinConditionDataSource
{
  async get(id: number): Promise<CasbinCondition | null> {
    const record = await database
      .select('*')
      .from('casbin_condition')
      .where('id', id)
      .first();

    if (!record) return null;

    return {
      id: record.id,
      condition: record.condition,
    };
  }

  async create(condition: string): Promise<CasbinCondition> {
    const [record] = await database
      .insert({
        condition: JSON.parse(condition),
      })
      .into('casbin_condition')
      .returning('*');

    return {
      id: record.id,
      condition: record.condition,
    };
  }
}
