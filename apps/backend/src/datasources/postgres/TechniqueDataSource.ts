import { injectable } from 'tsyringe';

import { Instrument } from '../../models/Instrument';
import { Technique } from '../../models/Technique';
import { TechniqueDataSource } from '../TechniqueDataSource';

@injectable()
export default class PostgresTechniqueDataSource
  implements TechniqueDataSource
{
  getTechnique(instrumentId: number): Promise<Technique | null> {
    throw new Error('Method not implemented.');
  }

  getTechniques(
    first?: number | undefined,
    offset?: number | undefined
  ): Promise<{ totalCount: number; techniques: Technique[] }> {
    throw new Error('Method not implemented.');
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
