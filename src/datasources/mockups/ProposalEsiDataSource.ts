import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Rejection } from '../../models/Rejection';
import { GetProposalEsisFilter } from '../../queries/ProposalEsiQueries';
import { CreateEsiArgs } from '../../resolvers/mutations/CreateEsiMutation';
import { UpdateEsiArgs } from '../../resolvers/mutations/UpdateEsiMutation';
import { ProposalEsiDataSource } from '../ProposalEsiDataSource';

export class ProposalEsiDataSourceMock implements ProposalEsiDataSource {
  esis: ExperimentSafetyInput[];
  constructor() {
    this.init();
  }

  public init() {
    this.esis = [new ExperimentSafetyInput(1, 1, 1, 1, false, new Date())];
  }

  // Create
  async createEsi(
    args: CreateEsiArgs & { questionaryId: number; creatorId: number }
  ): Promise<ExperimentSafetyInput | Rejection> {
    const newEsi = new ExperimentSafetyInput(
      2,
      args.visitId,
      args.creatorId,
      args.questionaryId,
      false,
      new Date()
    );
    this.esis.push(newEsi);

    return newEsi;
  }

  // Read
  async getEsi(esiId: number): Promise<ExperimentSafetyInput | null> {
    return this.esis.find((esi) => esi.id === esiId) || null;
  }
  async getEsis(
    filter: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[]> {
    return this.esis.filter((esi) => {
      const isVisitMatch = filter.visitId
        ? esi.visitId === filter.visitId
        : true;
      const isQuestionaryMatch = filter.questionaryId
        ? esi.questionaryId === filter.questionaryId
        : true;

      return isVisitMatch && isQuestionaryMatch;
    });
  }

  // Update
  async updateEsi(args: UpdateEsiArgs): Promise<ExperimentSafetyInput> {
    const esiToUpdate = this.esis.find((esi) => esi.id === args.esiId)!;
    if (args.isSubmitted !== undefined) {
      esiToUpdate.isSubmitted = args.isSubmitted;
    }

    return esiToUpdate;
  }
}
