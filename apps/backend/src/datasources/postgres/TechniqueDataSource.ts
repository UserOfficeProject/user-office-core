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
    try {
      const [technique]: TechniqueRecord[] = await database('techniques')
        .insert({
          short_code: args.shortCode,
          name: args.name,
          description: args.description,
        })
        .returning('*');

      if (technique) {
        return this.createTechniqueObject(technique);
      } else {
        throw new Error(
          'Failed to create technique: no technique returned from insert'
        );
      }
    } catch (error) {
      throw new Error(`Error creating technique: ${error}`);
    }
  }

  async getTechnique(techniqueId: number): Promise<Technique | null> {
    return database
      .select()
      .from('techniques')
      .where('technique_id', techniqueId)
      .first()
      .then((technique: TechniqueRecord | undefined) => {
        return technique ? this.createTechniqueObject(technique) : null;
      })
      .catch((error) => {
        throw new Error(`Error getting technique: ${error}`);
      });
  }

  async getTechniques(
    first?: number,
    offset?: number
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
      })
      .catch((error) => {
        throw new Error(`Error getting techniques: ${error}`);
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
      )
      .catch((error) => {
        throw new Error(`Error getting instruments by technique ID: ${error}`);
      });
  }

  async update(technique: Technique): Promise<Technique> {
    try {
      const [result]: TechniqueRecord[] = await database('techniques')
        .update({
          name: technique.name,
          short_code: technique.shortCode,
          description: technique.description,
        })
        .where('technique_id', technique.id)
        .returning('*');

      if (result) {
        return this.createTechniqueObject(result);
      } else {
        throw new Error(
          'Error updating technique: no technique returned from update'
        );
      }
    } catch (error) {
      throw new Error(`Error updating technique: ${error}`);
    }
  }

  async delete(techniqueId: number): Promise<Technique> {
    try {
      const [result]: TechniqueRecord[] = await database('techniques')
        .delete()
        .where('technique_id', techniqueId)
        .returning('*');

      if (result) {
        return this.createTechniqueObject(result);
      } else {
        throw new Error(
          'Error deleting technique: no technique returned from delete'
        );
      }
    } catch (error) {
      throw new Error(`Error deleting technique: ${error}`);
    }
  }

  async assignInstrumentsToTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean> {
    const dataToInsert = instrumentIds.map((instrumentId) => ({
      technique_id: techniqueId,
      instrument_id: instrumentId,
    }));

    try {
      const result = await database('technique_has_instruments').insert(
        dataToInsert
      );

      if (result) {
        return true;
      } else {
        throw new Error(
          'Error assigning instrument(s) to technique: no technique returned from insert'
        );
      }
    } catch (error) {
      throw new Error(`Error assigning instrument(s) to technique: ${error}`);
    }
  }

  async removeInstrumentsFromTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean> {
    try {
      const result = await database('technique_has_instruments')
        .whereIn('instrument_id', instrumentIds)
        .andWhere('technique_id', techniqueId)
        .del()
        .returning('*');

      if (result) {
        return true;
      } else {
        throw new Error(
          'Error removing instrument(s) from technique: no row(s) returned from delete'
        );
      }
    } catch (error) {
      throw new Error(`Error removing instrument(s) from technique: ${error}`);
    }
  }

  async assignProposalToTechniques(
    proposalPk: number,
    techniqueIds: number[]
  ): Promise<boolean> {
    const dataToInsert = techniqueIds.map((techniqueId) => ({
      technique_id: techniqueId,
      proposal_id: proposalPk,
    }));

    try {
      const result = await database('technique_has_proposals').insert(
        dataToInsert
      );

      if (result) {
        return true;
      } else {
        throw new Error(
          'Error assigning proposal to technique: no technique returned from insert'
        );
      }
    } catch (error) {
      throw new Error(`Error assigning proposal to technique: ${error}`);
    }
  }

  async getTechniquesByIds(techniqueIds: number[]): Promise<Technique[]> {
    return database
      .select()
      .from('techniques')
      .whereIn('technique_id', techniqueIds)
      .then((results: TechniqueRecord[]) =>
        results.map(this.createTechniqueObject)
      )
      .catch((error) => {
        throw new Error(`Error getting techniques: ${error}`);
      });
  }

  async getTechniquesByInstrumentIds(
    instrumentIds: number[]
  ): Promise<Technique[]> {
    try {
      const uniqueTechniqueIds = await database('technique_has_instruments')
        .whereIn('instrument_id', instrumentIds)
        .distinct()
        .pluck('technique_id');

      return this.getTechniquesByIds(uniqueTechniqueIds);
    } catch (error) {
      throw new Error(`Error getting techniques by instrument IDs: ${error}`);
    }
  }
}
