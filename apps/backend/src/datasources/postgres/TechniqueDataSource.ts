import { injectable } from 'tsyringe';

import { Instrument } from '../../models/Instrument';
import { Technique } from '../../models/Technique';
import { TechniqueDataSource } from '../TechniqueDataSource';
import database from './database';
import { TechniqueRecord } from './records';

@injectable()
export default class PostgresTechniqueDataSource
  implements TechniqueDataSource
{
  getTechnique(techniqueId: number): Promise<Technique | null> {
    return database
      .select()
      .from('techniques')
      .where('technique_id', techniqueId)
      .first()
      .then((technique: TechniqueRecord | null) =>
        technique ? this.createTechniqueObject(technique) : null
      );
  }

  getTechniques(
    first?: number | undefined,
    offset?: number | undefined
  ): Promise<{ totalCount: number; techniques: Technique[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('techniques')
      .orderBy('technique_id', 'desc')
      .modify((query) => {
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((techniques: TechniqueRecord[]) => {
        const result = techniques.map((technique) =>
          this.createTechniqueObject(technique)
        );

        return {
          totalCount: techniques[0] ? techniques[0].full_count : 0,
          techniques: result,
        };
      });
  }
  createTechniqueObject(technique: TechniqueRecord): any {
    return new Technique(
      technique.technique_id,
      technique.name,
      technique.short_code,
      technique.description
    );
  }

  getInstrumentsByTechniqueId(techniqueId: number): Promise<Instrument[]> {
    throw new Error('Method not implemented.');
  }

  update(technique: Technique): Promise<Technique> {
    throw new Error('Method not implemented.');
  }

  delete(technique: number): Promise<Technique> {
    throw new Error('Method not implemented.');
  }
}
