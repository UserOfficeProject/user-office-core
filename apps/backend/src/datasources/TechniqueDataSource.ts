import { Instrument } from '../models/Instrument';
import { Technique } from '../models/Technique';

export interface TechniqueDataSource {
  // create(args: CreateTechniqueArgs): Promise<Technique>;
  getTechnique(techniqueId: number): Promise<Technique | null>;
  getTechniques(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; techniques: Technique[] }>;
  getInstrumentsByTechniqueId(techniqueId: number): Promise<Instrument[]>;
  update(technique: Technique): Promise<Technique>;
  delete(technique: number): Promise<Technique>;
}
