import { GraphQLError } from 'graphql';
import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { Roles } from '../../models/Role';
import { Technique } from '../../models/Technique';
import { UserWithRole } from '../../models/User';
import { ProposalViewTechnicalReview } from '../../resolvers/types/ProposalView';
import { removeDuplicates } from '../../utils/helperFunctions';
import { CallDataSource } from '../CallDataSource';
import database from '../postgres/database';
import {
  CallRecord,
  createCallObject,
  createProposalViewObject,
  createProposalViewObjectWithTechniques,
  ProposalViewRecord,
  TechniqueRecord,
} from '../postgres/records';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import PostgresProposalDataSource from './../postgres/ProposalDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

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

    const xpressCallIds: number[] = (
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

          const propsWithXpressFilter = xpressCallIds.length
            ? propsWithUserFilter.filter(
                (prop) => !xpressCallIds.includes(prop.callId)
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

  createTechniqueObject(technique: TechniqueRecord): Technique {
    return new Technique(
      technique.technique_id,
      technique.name,
      technique.short_code,
      technique.description
    );
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
    /*
    Get proposal PKs and techniques and apply most filtering.
    It is more efficient to do this filtering earlier on despite
    multiple rows being returned per PK due to the joins.
    */
    type ProposalPkWithTechnique = TechniqueRecord & { proposalPk: number };

    const proposalsWithTechnique: ProposalPkWithTechnique[] = await database
      .select(['proposals.proposal_pk as proposalPk', 'tech.*'])
      .from('proposals')
      .join(
        'technique_has_proposals as thp',
        'thp.proposal_id',
        '=',
        'proposals.proposal_pk'
      )
      .join('techniques as tech', 'tech.technique_id', '=', 'thp.technique_id')
      .leftJoin(
        'technique_has_scientists as ths',
        'ths.technique_id',
        '=',
        'thp.technique_id'
      )
      .leftJoin(
        'technique_has_instruments as thi',
        'thi.technique_id',
        '=',
        'thp.technique_id'
      )
      .leftJoin(
        'instruments as ins',
        'thi.instrument_id',
        '=',
        'ins.instrument_id'
      )
      .modify((query) => {
        const instrumentId = filter?.instrumentFilter?.instrumentId;

        if (instrumentId && !isNaN(instrumentId)) {
          query.join('instrument_has_proposals as ihp', function () {
            this.on('ihp.proposal_pk', '=', 'proposals.proposal_pk').andOnVal(
              'ihp.instrument_id',
              '=',
              instrumentId
            );
          });
        }
      })
      .where((query) => {
        if (user.currentRole?.shortCode === Roles.INSTRUMENT_SCIENTIST) {
          query.where('ths.user_id', user.id);
        }

        if (searchText) {
          query.andWhere((qb) =>
            qb
              .orWhereRaw('proposals.proposal_id ILIKE ?', `%${searchText}%`)
              .orWhereRaw('title ILIKE ?', `%${searchText}%`)
          );
        }

        if (filter?.callId) {
          query.where('call_id', filter.callId);
        }

        if (filter?.proposalStatusId) {
          query.where('status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposals.proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposals.proposal_id', filter.referenceNumbers);
        }

        if (filter?.excludeProposalStatusIds) {
          query.where('status_id', 'not in', filter?.excludeProposalStatusIds);
        }

        if (
          filter?.dateFilter?.from !== undefined &&
          filter?.dateFilter?.from !== null &&
          filter?.dateFilter?.from !== 'Invalid DateTime'
        ) {
          const dateParts: string[] = filter.dateFilter.from.split('-');
          const year = +dateParts[2];
          const month = +dateParts[1] - 1;
          const day = +dateParts[0];

          const dateObject: Date = new Date(year, month, day);

          query.where(function () {
            this.where('submitted_date', '>=', dateObject).orWhere(function () {
              this.whereNull('submitted_date').andWhere(
                'created_at',
                '>=',
                dateObject
              );
            });
          });
        }

        if (
          filter?.dateFilter?.to !== undefined &&
          filter?.dateFilter?.to !== null &&
          filter?.dateFilter?.to !== 'Invalid DateTime'
        ) {
          const dateParts: string[] = filter.dateFilter.to.split('-');
          const year = +dateParts[2];
          const month = +dateParts[1] - 1;
          const day = +dateParts[0];

          const dateObject: Date = new Date(year, month, day);

          query.where(function () {
            this.where('submitted_date', '<=', dateObject).orWhere(function () {
              this.whereNull('submitted_date').andWhere(
                'created_at',
                '<=',
                dateObject
              );
            });
          });
        }
      });

    /*
    Make a map of each unique PK and its techniques.
    */
    const proposalTechniquesMap: Record<number, Technique[]> =
      proposalsWithTechnique.reduce(
        (acc, record) => {
          const { proposalPk, ...techniqueRecord } = record;

          const newTechnique = this.createTechniqueObject(techniqueRecord);

          if (!acc[proposalPk]) {
            acc[proposalPk] = [];
          }

          if (
            !acc[proposalPk].some(
              (existingTechnique) => existingTechnique.id === newTechnique.id
            )
          ) {
            acc[proposalPk].push(newTechnique);
          }

          return acc;
        },
        {} as Record<number, Technique[]>
      );

    const proposalPks = Object.keys(proposalTechniquesMap).map(Number);

    /*
    Get the unique list of PKs from the view and apply the last part
    of filtering needed at the end. The technique is retrieved from the map.
    */
    const result = database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .whereIn('proposal_pk', proposalPks)
      .modify((query) => {
        if (filter?.techniqueFilter?.techniqueId) {
          const filteredPksByTechnique = Object.keys(proposalTechniquesMap)
            .map(Number)
            .filter((proposalPk) =>
              proposalTechniquesMap[proposalPk]?.some(
                (technique) =>
                  technique.id === filter.techniqueFilter?.techniqueId
              )
            );

          query.whereIn('proposal_pk', filteredPksByTechnique);
        }

        if (sortField && sortDirection) {
          if (!fieldMap.hasOwnProperty(sortField)) {
            throw new GraphQLError(`Bad sort field given: ${sortField}`);
          }
          sortField = fieldMap[sortField];
          query.orderBy(sortField, sortDirection);
        } else {
          query.orderBy('proposal_pk', 'desc');
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) => {
          const proposalTechniques =
            proposalTechniquesMap[proposal.proposal_pk];

          if (proposalTechniques?.length) {
            return createProposalViewObjectWithTechniques(
              proposal,
              proposalTechniques.sort((a, b) => a.name.localeCompare(b.name))
            );
          }

          return createProposalViewObject(proposal);
        });

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });

    return result;
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
