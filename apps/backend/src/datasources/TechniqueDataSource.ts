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
  getInstrumentsByTechniqueId(techniqueId: number): Promise<Instrument[]>;
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
  assignProposalToTechnique(
    proposalPk: number,
    techniqueIds: number[]
  ): Promise<boolean>;
  getTechniquesByIds(techniqueIds: number[]): Promise<Technique[]>;
}
