import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { UserWithRole } from '../../models/User';
import { ProposalViewTechnicalReview } from '../../resolvers/types/ProposalView';
import { removeDuplicates } from '../../utils/helperFunctions';
import { CallDataSource } from '../CallDataSource';
import PostgresAdminDataSource from '../postgres/AdminDataSource';
import database from '../postgres/database';
import { CallRecord, createCallObject } from '../postgres/records';
import PostgresWorkflowDataSource from '../postgres/WorkflowDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import PostgresProposalDataSource from './../postgres/ProposalDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

const postgresProposalDataSource = new PostgresProposalDataSource(
  new PostgresWorkflowDataSource(),
  new PostgresAdminDataSource()
);

const fieldMap: { [key: string]: string } = {
  finalStatus: 'final_status',
  callShortCode: 'call_short_code',
  //'instruments.name': "instruments->0->'name'",
  statusName: 'proposal_status_id',
  proposalId: 'proposal_id',
  title: 'title',
  submitted: 'submitted',
  notified: 'notified',
  submittedDate: 'submitted_date',
};

@injectable()
export default class StfcProposalDataSource extends PostgresProposalDataSource {
  protected stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;
  protected callDataSource: CallDataSource = container.resolve(
    Tokens.CallDataSource
  ) as CallDataSource;

  async getInstrumentScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const stfcUserIds: number[] = filter?.text
      ? [
          ...(
            await this.stfcUserDataSource.getUsers({ filter: filter.text })
          ).users.map((user) => user.id),
        ]
      : [];

    const techniqueProposalCallIds: number[] = (
      await this.callDataSource.getCalls({
        proposalStatusShortCode: 'QUICK_REVIEW',
      })
    ).map((call) => call.id);

    const proposals = super
      .getInstrumentScientistProposals(user, filter, first, offset)
      .then(
        async (proposals: {
          proposals: ProposalView[];
          totalCount: number;
        }) => {
          const propsWithUserFilter = stfcUserIds.length
            ? proposals.proposals.filter((prop) =>
                stfcUserIds.includes(prop.principalInvestigatorId)
              )
            : proposals.proposals;

          const propsWithXpressFilter = techniqueProposalCallIds.length
            ? propsWithUserFilter.filter(
                (prop) => !techniqueProposalCallIds.includes(prop.callId)
              )
            : propsWithUserFilter;

          const propsWithTechReviewerDetails =
            await this.getTechReviewersDetails(propsWithXpressFilter);

          return {
            totalCount: propsWithTechReviewerDetails.length,
            proposals: propsWithTechReviewerDetails,
          };
        }
      );

    return proposals;
  }

  async getProposalsFromView(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }> {
    const stfcUserIds: number[] = searchText
      ? [
          ...(
            await this.stfcUserDataSource.getUsers({ filter: searchText })
          ).users.map((ids) => ids.id),
        ]
      : [];
    const proposals = await super.getProposalsFromView(
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText,
      stfcUserIds
    );

    const propsWithTechReviewerDetails = await this.getTechReviewersDetails(
      proposals.proposalViews
    );

    return {
      proposalViews: propsWithTechReviewerDetails,
      totalCount: proposals.totalCount,
    };
  }

  async cloneProposal(sourceProposal: Proposal, call: Call): Promise<Proposal> {
    const result = await database
      .select()
      .from('call')
      .where('call_id', sourceProposal.callId)
      .first()
      .then((call: CallRecord | null) =>
        call ? createCallObject(call) : null
      );

    if (result?.templateId === 15 && result?.proposalWorkflowId === 5) {
      return Promise.reject(
        ` ('${sourceProposal.proposalId}') because it is a legacy proposal `
      );
    }

    return await super.cloneProposal(sourceProposal, call);
  }

  async getTechniqueScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return postgresProposalDataSource.getTechniqueScientistProposals(
      user,
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText
    );
  }

  async getUsersProposalsByFacility(
    userId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    const proposals = await super.getUsersProposalsByFacility(
      userId,
      filter,
      first,
      offset
    );

    const propsWithTechReviewerDetails = await this.getTechReviewersDetails(
      proposals.proposals
    );

    return {
      proposals: propsWithTechReviewerDetails,
      totalCount: proposals.totalCount,
    };
  }

  async getTechReviewersDetails(proposals: ProposalView[]) {
    const technicalReviewers = removeDuplicates(
      proposals
        .filter((proposal) => !!proposal.technicalReviews?.length)
        .map(({ technicalReviews }) =>
          (technicalReviews as ProposalViewTechnicalReview[]).map(
            (techicalReview) =>
              techicalReview.technicalReviewAssignee.id.toString()
          )
        )
        .flat()
    );

    const technicalReviewersDetails =
      await this.stfcUserDataSource.getStfcBasicPeopleByUserNumbers(
        technicalReviewers,
        false
      );

    return proposals.map((proposal) => {
      let proposalTechnicalReviews: ProposalViewTechnicalReview[] = [];
      const { technicalReviews } = proposal;

      if (technicalReviews?.length) {
        proposalTechnicalReviews = technicalReviews.map((technicalReview) => {
          const userDetails = technicalReviewersDetails.find(
            (trd) =>
              trd.userNumber ===
              technicalReview.technicalReviewAssignee.id.toString()
          );

          const firstName = userDetails?.firstNameKnownAs
            ? userDetails.firstNameKnownAs
            : userDetails?.givenName ?? '';
          const lastName = userDetails?.familyName ?? '';

          return {
            ...technicalReview,
            technicalReviewAssignee: {
              id: technicalReview.technicalReviewAssignee.id,
              firstname: firstName,
              lastname: lastName,
            },
          };
        });
      }

      return {
        ...proposal,
        technicalReviews: proposalTechnicalReviews,
      };
    });
  }
}
