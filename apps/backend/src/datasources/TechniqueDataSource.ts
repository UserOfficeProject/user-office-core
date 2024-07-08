import { Instrument } from '../models/Instrument';
import { Technique } from '../models/Technique';
import { CreateTechniqueArgs } from '../resolvers/mutations/CreateTechniqueMutation';

export interface TechniqueDataSource {
  create(args: CreateTechniqueArgs): Promise<Technique>;
  getTechnique(techniqueId: number): Promise<Technique | null>;
  getTechniques(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; techniques: Technique[] }>;
  getTechniquesByIds(techniqueIds: number[]): Promise<Technique[]>;
  getInstrumentsByTechniqueId(techniqueId: number): Promise<Instrument[]>;
  getTechniquesByInstrumentIds(instrumentIds: number[]): Promise<Technique[]>;
  update(technique: Technique): Promise<Technique>;
  delete(techniqueId: number): Promise<Technique>;
  assignInstrumentsToTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean>;
  removeInstrumentsFromTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean>;
  assignProposalToTechniques(
    proposalPk: number,
    techniqueIds: number[]
  ): Promise<boolean>;
}
