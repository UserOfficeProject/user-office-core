import { injectable } from 'tsyringe';

import { Instrument } from '../../models/Instrument';
import { Technique } from '../../models/Technique';
import { CreateTechniqueArgs } from '../../resolvers/mutations/CreateTechniqueMutation';
import { TechniqueDataSource } from '../TechniqueDataSource';
import database from './database';
import {
  InstrumentRecord,
  TechniqueRecord,
  createInstrumentObject,
} from './records';

@injectable()
export default class PostgresTechniqueDataSource
  implements TechniqueDataSource
{
  createTechniqueObject(technique: TechniqueRecord): Technique {
    return new Technique(
      technique.technique_id,
      technique.name,
      technique.short_code,
      technique.description
    );
  }

  async create(args: CreateTechniqueArgs): Promise<Technique> {
    const [technique]: TechniqueRecord[] = await database('techniques')
      .insert({
        short_code: args.shortCode,
        name: args.name,
        description: args.description,
      })
      .returning('*');

    return technique ? this.createTechniqueObject(technique) : Promise.reject();
  }

  async getTechnique(techniqueId: number): Promise<Technique | null> {
    return database
      .select()
      .from('techniques')
      .where('technique_id', techniqueId)
      .first()
      .then((technique: TechniqueRecord | undefined) =>
        technique ? this.createTechniqueObject(technique) : null
      );
  }

  async getTechniques(
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

  async getInstrumentsByTechniqueId(
    techniqueId: number
  ): Promise<Instrument[]> {
    return database
      .select()
      .from('instruments as instr')
      .join('technique_has_instruments as tech_instr', {
        'instr.instrument_id': 'tech_instr.instrument_id',
      })
      .where('technique_id', techniqueId)
      .then((results: InstrumentRecord[]) =>
        results.map(createInstrumentObject)
      );
  }

  async update(technique: Technique): Promise<Technique> {
    const [result]: TechniqueRecord[] = await database('techniques')
      .update({
        name: technique.name,
        short_code: technique.shortCode,
        description: technique.description,
      })
      .where('technique_id', technique.techniqueId)
      .returning('*');

    return technique ? this.createTechniqueObject(result) : Promise.reject();
  }

  async delete(techniqueId: number): Promise<Technique> {
    const [result]: TechniqueRecord[] = await database('techniques')
      .delete()
      .where('technique_id', techniqueId)
      .returning('*');

    return result ? this.createTechniqueObject(result) : Promise.reject();
  }

  async assignInstrumentsToTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean> {
    const dataToInsert = instrumentIds.map((instrumentId) => ({
      technique_id: techniqueId,
      instrument_id: instrumentId,
    }));

    const result = await database('technique_has_instruments').insert(
      dataToInsert
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  async removeInstrumentFromTechnique(
    instrumentId: number,
    techniqueId: number
  ): Promise<boolean> {
    const result = await database('technique_has_instruments')
      .where('instrument_id', instrumentId)
      .andWhere('technique_id', techniqueId)
      .del();

    if (result) {
      return true;
    } else {
      return false;
    }
  }
}
