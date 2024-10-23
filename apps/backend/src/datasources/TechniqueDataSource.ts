import { Instrument } from '../models/Instrument';
import { Technique } from '../models/Technique';
import { BasicUserDetails } from '../models/User';
import { CreateTechniqueArgs } from '../resolvers/mutations/CreateTechniqueMutation';

export interface TechniqueDataSource {
  create(args: CreateTechniqueArgs): Promise<Technique>;
  getTechnique(techniqueId: number): Promise<Technique | null>;
  getTechniques(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; techniques: Technique[] }>;
  getTechniquesByIds(techniqueIds: number[]): Promise<Technique[]>;
  getInstrumentsByTechniqueIds(techniqueIds: number[]): Promise<Instrument[]>;
  getTechniquesByInstrumentIds(instrumentIds: number[]): Promise<Technique[]>;
  getTechniqueScientists(techniqueId: number): Promise<BasicUserDetails[]>;
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
  assignScientistsToTechnique(
    scientistIds: number[],
    techniqueId: number
  ): Promise<boolean>;
  removeScientistFromTechnique(
    scientistId: number,
    techniqueId: number
  ): Promise<boolean>;
  getTechniquesByProposalPk(proposalPk: number): Promise<Technique[]>;
  isXpressInstrumentAndProposal(
    proposalPk: number,
    instrumentId: number
  ): Promise<boolean>;
}
