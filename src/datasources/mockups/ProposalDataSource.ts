/* eslint-disable @typescript-eslint/camelcase */
import 'reflect-metadata';
import { Proposal, ProposalEndStatus } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';

export let dummyProposal: Proposal;
export let dummyProposalSubmitted: Proposal;
let allProposals: Proposal[];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

const dummyProposalFactory = (values?: Partial<Proposal>) => {
  return new Proposal(
    values?.id || 1,
    values?.title || 'title',
    values?.abstract || 'abstract',
    values?.proposerId || 1,
    values?.statusId || 1,
    values?.created || new Date(),
    values?.updated || new Date(),
    values?.shortCode || 'shortCode',
    values?.rankOrder || 1,
    values?.finalStatus || ProposalEndStatus.UNSET,
    values?.callId || 1,
    values?.questionaryId || 1,
    values?.commentForUser || 'comment for user',
    values?.commentForManagement || 'comment for management',
    values?.notified || false,
    values?.submitted || false
  );
};

export class ProposalDataSourceMock implements ProposalDataSource {
  async getProposalsFromView(
    filter?: ProposalsFilter | undefined
  ): Promise<ProposalView[]> {
    return [];
  }
  public init() {
    dummyProposal = dummyProposalFactory({ id: 1 });
    dummyProposalSubmitted = dummyProposalFactory({
      id: 2,
      title: 'Submitted proposal',
      submitted: true,
      finalStatus: ProposalEndStatus.ACCEPTED,
      notified: true,
    });

    allProposals = [dummyProposal, dummyProposalSubmitted];
  }

  async deleteProposal(id: number): Promise<Proposal> {
    const dummyProposalRef = dummyProposalFactory(dummyProposal);
    dummyProposal.id = -1; // hacky

    return dummyProposalRef;
  }

  async checkActiveCall(callId: number): Promise<boolean> {
    return true;
  }

  async rejectProposal(proposalId: number): Promise<Proposal> {
    if (dummyProposal.id !== proposalId) {
      throw new Error('Wrong ID');
    }

    dummyProposal.finalStatus = ProposalEndStatus.REJECTED; // What is the final status for rejecte?

    return dummyProposal;
  }

  async update(proposal: Proposal): Promise<Proposal> {
    if (proposal.id !== dummyProposal.id) {
      throw new Error('Proposal does not exist');
    }
    dummyProposal = proposal;

    return dummyProposal;
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    throw new Error('Not implemented');
  }

  async submitProposal(id: number): Promise<Proposal> {
    if (id !== dummyProposal.id) {
      throw new Error('Wrong ID');
    }
    dummyProposal.submitted = true;

    return dummyProposal;
  }

  async get(id: number) {
    return (
      [dummyProposal, dummyProposalSubmitted].find(
        proposal => proposal.id === id
      ) || null
    );
  }

  async create(proposerId: number, callId: number, questionaryId: number) {
    const newProposal = dummyProposalFactory({
      proposerId,
      callId,
      questionaryId,
    });
    allProposals.push(newProposal);

    return newProposal;
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return { totalCount: allProposals.length, proposals: allProposals };
  }

  async getUserProposals(id: number) {
    return allProposals.filter(proposal => proposal.proposerId === id);
  }

  async getInstrumentScientistProposals(
    scientsitId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return { totalCount: 1, proposals: [dummyProposal] };
  }
}
