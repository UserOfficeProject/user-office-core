import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { GetProposalEsisFilter } from '../../queries/ProposalEsiQueries';
import { ProposalEsiDataSource } from '../ProposalEsiDataSource';

export class ProposalEsiDataSourceMock implements ProposalEsiDataSource {
  esis: ExperimentSafetyInput[];
  constructor() {
    this.init();
  }

  public init() {
    this.esis = [new ExperimentSafetyInput(1, 1, 1, 1, false, new Date())];
  }

  // Read
  async getEsi(esiId: number): Promise<ExperimentSafetyInput | null> {
    return this.esis.find((esi) => esi.id === esiId) || null;
  }
  async getEsis(
    filter: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[]> {
    return this.esis.filter((esi) => {
      const isVisitMatch = filter.scheduledEventId
        ? esi.scheduledEventId === filter.scheduledEventId
        : true;
      const isQuestionaryMatch = filter.questionaryId
        ? esi.questionaryId === filter.questionaryId
        : true;

      return isVisitMatch && isQuestionaryMatch;
    });
  }
}
