import { Instrument } from '../../models/Instrument';
import { Technique } from '../../models/Technique';
import { BasicUserDetails } from '../../models/User';
import { CreateTechniqueArgs } from '../../resolvers/mutations/CreateTechniqueMutation';
import { TechniqueDataSource } from '../TechniqueDataSource';
import { dummyInstruments } from './InstrumentDataSource';
import { basicDummyUser } from './UserDataSource';

export const dummyTechnique1 = new Technique(
  1,
  'Dummy technique 1',
  'technique_1',
  'Technique 1 description'
);

export const dummyTechnique2 = new Technique(
  2,
  'Dummy technique 2',
  'technique_2',
  'Technique 2 description'
);

const dummyTechniques = [dummyTechnique1, dummyTechnique2];

export class TechniqueDataSourceMock implements TechniqueDataSource {
  async create(args: CreateTechniqueArgs): Promise<Technique> {
    return dummyTechnique1;
  }

  async getTechnique(techniqueId: number): Promise<Technique | null> {
    const technique = dummyTechniques.find((t) => t.id === techniqueId);

    return technique ? technique : null;
  }

  async getTechniques(
    first?: number | undefined,
    offset?: number | undefined
  ): Promise<{ totalCount: number; techniques: Technique[] }> {
    return { totalCount: dummyTechniques.length, techniques: dummyTechniques };
  }

  async getInstrumentsByTechniqueIds(
    techniqueIds: number[]
  ): Promise<Instrument[]> {
    return dummyInstruments;
  }

  async update(technique: Technique): Promise<Technique> {
    return { ...dummyTechnique1, ...technique };
  }

  async delete(techniqueId: number): Promise<Technique> {
    return dummyTechnique1;
  }

  async assignInstrumentsToTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean> {
    return true;
  }

  async removeInstrumentsFromTechnique(
    instrumentIds: number[],
    techniqueId: number
  ): Promise<boolean> {
    return true;
  }

  async assignProposalToTechniques(
    proposalPk: number,
    techniqueIds: number[]
  ): Promise<boolean> {
    if (proposalPk && techniqueIds) {
      return true;
    }

    return false;
  }

  async getTechniquesByIds(techniqueIds: number[]): Promise<Technique[]> {
    if (techniqueIds) {
      return dummyTechniques;
    }

    return [];
  }

  async getTechniquesByInstrumentIds(
    instrumentIds: number[]
  ): Promise<Technique[]> {
    if (instrumentIds) {
      return dummyTechniques;
    }

    return [];
  }

  async getTechniqueScientists(
    techniqueId: number
  ): Promise<BasicUserDetails[]> {
    return [basicDummyUser];
  }

  async assignScientistsToTechnique(
    scientistIds: number[],
    techniqueId: number
  ): Promise<boolean> {
    return true;
  }

  async removeScientistFromTechnique(
    scientistId: number,
    techniqueId: number
  ): Promise<boolean> {
    return true;
  }

  async getTechniquesByProposalPk(proposalPk: number): Promise<Technique[]> {
    if (proposalPk) {
      return dummyTechniques;
    }

    return [];
  }

  async hasProposalTechniques(proposalPks: number[]): Promise<boolean> {
    if (proposalPks) {
      return true;
    }

    return true;
  }
}
