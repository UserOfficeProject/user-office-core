/* eslint-disable quotes */
import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { Knex } from 'knex';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Call } from '../../models/Call';
import { InvitedProposal, Proposal, Proposals } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { getQuestionDefinition } from '../../models/questionTypes/QuestionRegistry';
import { ReviewerFilter } from '../../models/Review';
import { Roles } from '../../models/Role';
import { SettingsId } from '../../models/Settings';
import { TechnicalReview } from '../../models/TechnicalReview';
import { Technique } from '../../models/Technique';
import { UserWithRole } from '../../models/User';
import { UpdateTechnicalReviewAssigneeInput } from '../../resolvers/mutations/UpdateTechnicalReviewAssigneeMutation';
import { UserProposalsFilter } from '../../resolvers/types/User';
import { PaginationSortDirection } from '../../utils/pagination';
import { AdminDataSource } from '../AdminDataSource';
import { ProposalDataSource } from '../ProposalDataSource';
import { WorkflowDataSource } from '../WorkflowDataSource';
import {
  ProposalsFilter,
  QuestionFilterInput,
} from './../../resolvers/queries/ProposalsQuery';
import CallDataSource from './CallDataSource';
import database from './database';
import {
  createInvitedProposalObject,
  createProposalObject,
  createProposalViewObject,
  createProposalViewObjectWithTechniques,
  createTechnicalReviewObject,
  InvitedProposalRecord,
  ProposalRecord,
  ProposalViewRecord,
  TechnicalReviewRecord,
  TechniqueRecord,
  WorkflowStatusRecord,
} from './records';

const fieldMap: { [key: string]: string } = {
  finalStatus: 'final_status',
  'technicalReviews.status': 'technical_review_status',
  'technicalReviews.timeAllocation': 'technical_review_time_allocation',
  // NOTE: For now sorting by first name only is completly fine because the full name is constructed from frist + last
  technicalReviewAssigneesFullName: 'technical_review_assignee',
  'faps.code': 'fap_code',
  callShortCode: 'call_short_code',
  'instruments.name': 'instrument_name',
  statusName: 'proposal_status_id',
  'instruments.managementTimeAllocation':
    'instrument_management_time_allocation',
  proposalId: 'proposal_id',
  title: 'title',
  submitted: 'submitted',
  notified: 'notified',
  submittedDate: 'submitted_date',
};

export async function calculateReferenceNumber(
  format: string,
  sequence: number | null
): Promise<string> {
  const prefix: string = format.slice(0, format.indexOf('{'));
  const formatParameters: { [param: string]: string } = {};
  format.match(/(\w+:\w+)/g)?.forEach((el: string) => {
    const [k, v] = el.split(':');
    formatParameters[k] = v;
  });

  if (!prefix || !('digits' in formatParameters)) {
    return Promise.reject(
      new Error(`The reference number format ('${format}') is invalid`)
    );
  }

  sequence = sequence ?? 0;
  if (String(sequence).length > Number(formatParameters['digits'])) {
    return Promise.reject(
      new Error(
        `The sequence number provided ('${formatParameters['digits']}') exceeds the format's digits parameter`
      )
    );
  }
  const paddedSequence: string = String(sequence).padStart(
    Number(formatParameters['digits']),
    '0'
  );

  return prefix + paddedSequence;
}

@injectable()
export default class PostgresProposalDataSource implements ProposalDataSource {
  constructor(
    @inject(Tokens.WorkflowDataSource)
    private workflowDataSource: WorkflowDataSource,
    @inject(Tokens.AdminDataSource)
    private adminDataSource: AdminDataSource,
    @inject(Tokens.CallDataSource)
    protected callDataSource: CallDataSource
  ) {}

  async updateProposalTechnicalReviewer({
    userId,
    proposalPks,
    instrumentId,
  }: UpdateTechnicalReviewAssigneeInput): Promise<TechnicalReview[]> {
    const response = await database('technical_review')
      .update('technical_review_assignee_id', userId)
      .whereIn('proposal_pk', proposalPks)
      .andWhere('instrument_id', instrumentId)
      .returning('*')
      .then((technicalReviews: TechnicalReviewRecord[]) => {
        return technicalReviews.map((technicalReview) =>
          createTechnicalReviewObject(technicalReview)
        );
      });

    return response;
  }

  async submitProposal(
    primaryKey: number,
    referenceNumber?: string
  ): Promise<Proposal> {
    const proposal: ProposalRecord[] | undefined = await database.transaction(
      async (trx) => {
        try {
          const call = await database
            .select(
              'c.call_id',
              'c.reference_number_format',
              'c.proposal_sequence'
            )
            .from('call as c')
            .join('proposals as p', { 'p.call_id': 'c.call_id' })
            .where('p.proposal_pk', primaryKey)
            .first()
            .forUpdate()
            .transacting(trx);

          let ref: string | null;

          if (referenceNumber !== undefined) {
            ref = referenceNumber;
          } else if (call.reference_number_format) {
            ref = await calculateReferenceNumber(
              call.reference_number_format,
              call.proposal_sequence
            );

            if (!ref) {
              throw new GraphQLError(
                `Failed to calculate reference number for proposal with id '${primaryKey}' using format '${call.reference_number_format}'`
              );
            } else if (ref.length > 16) {
              throw new GraphQLError(
                `The reference number calculated is too long ('${ref.length} characters)`
              );
            }
          }

          await database
            .update({
              proposal_sequence: (call.proposal_sequence ?? 0) + 1,
            })
            .from('call as c')
            .where('c.call_id', call.call_id)
            .transacting(trx);

          const proposalUpdate = await database
            .from('proposals')
            .returning('*')
            .where('proposal_pk', primaryKey)
            .modify((query) => {
              if (ref) {
                query.update({
                  proposal_id: ref,
                  reference_number_sequence: call.proposal_sequence ?? 0,
                  submitted: true,
                  submitted_date: new Date(),
                });
              } else {
                query.update({
                  reference_number_sequence: call.proposal_sequence ?? 0,
                  submitted: true,
                  submitted_date: new Date(),
                });
              }
            })
            .transacting(trx);

          return await trx.commit(proposalUpdate);
        } catch (error) {
          logger.logException(
            `Failed to submit proposal with id '${primaryKey}'`,
            error
          );
        }
      }
    );

    if (proposal?.length !== 1) {
      throw new GraphQLError(
        `Failed to submit proposal with id '${primaryKey}'`
      );
    }

    return createProposalObject(proposal[0]);
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return database('proposals')
      .where('proposals.proposal_pk', id)
      .del()
      .from('proposals')
      .returning('*')
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new GraphQLError(`Could not delete proposal with id:${id}`);
        }

        return createProposalObject(proposal[0]);
      });
  }

  async addProposalUser(proposalPk: number, userId: number): Promise<void> {
    return database
      .insert({ proposal_pk: proposalPk, user_id: userId })
      .into('proposal_user');
  }

  async setProposalUsers(proposalPk: number, userIds: number[]): Promise<void> {
    return database.transaction(async (trx) => {
      return database
        .from('proposal_user')
        .where('proposal_pk', proposalPk)
        .del()
        .transacting(trx)
        .then(() => {
          return Promise.all(
            userIds.map((userId) =>
              database
                .insert({ proposal_pk: proposalPk, user_id: userId })
                .into('proposal_user')
                .transacting(trx)
            )
          );
        })
        .then(() => {
          trx.commit;
        })
        .catch((error) => {
          trx.rollback;
          throw error; // re-throw
        });
    });
  }

  async update(proposal: Proposal): Promise<Proposal> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          proposer_id: proposal.proposerId,
          status_id: proposal.statusId,
          created_at: proposal.created,
          updated_at: proposal.updated,
          proposal_id: proposal.proposalId,
          final_status: proposal.finalStatus,
          call_id: proposal.callId,
          questionary_id: proposal.questionaryId,
          comment_for_user: proposal.commentForUser,
          comment_for_management: proposal.commentForManagement,
          notified: proposal.notified,
          submitted: proposal.submitted,
          management_decision_submitted: proposal.managementDecisionSubmitted,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_pk', proposal.primaryKey)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`Proposal not found ${proposal.primaryKey}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async updateProposalWfStatus(
    proposalPk: number,
    proposalWfStatusId: number
  ): Promise<Proposal> {
    return database
      .update({ workflow_status_id: proposalWfStatusId }, ['*'])
      .from('proposals')
      .where('proposal_pk', proposalPk)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`Proposal not found ${proposalPk}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async get(id: number): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('proposal_pk', id)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async getByQuestionaryId(questionaryId: number): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('questionary_id', questionaryId)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async create(
    proposer_id: number,
    call_id: number,
    questionary_id: number
  ): Promise<Proposal> {
    const call = await this.callDataSource.getCall(call_id);

    if (!call) {
      throw new GraphQLError(`Call not found with id: ${call_id}`);
    }

    const proposalInitialStatus =
      await this.workflowDataSource.getInitialWorkflowStatus(
        call.proposalWorkflowId
      );

    if (!proposalInitialStatus) {
      throw new GraphQLError(
        `Draft workflow status not found for call with id: ${call_id}`
      );
    }

    return database
      .insert(
        {
          proposer_id,
          call_id,
          questionary_id,
          workflow_status_id: proposalInitialStatus.workflowStatusId,
        },
        ['*']
      )
      .from('proposals')
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      });
  }

  addQuestionFilter(
    query: Knex.QueryBuilder,
    questionFilter: QuestionFilterInput
  ) {
    const questionFilterQuery = getQuestionDefinition(
      questionFilter.dataType
    ).filterQuery;

    if (!questionFilterQuery) {
      throw new GraphQLError(
        `Filter query not implemented for ${questionFilter.dataType}`
      );
    }

    query
      .leftJoin(
        'answers',
        'answers.questionary_id',
        'proposal_table_view.questionary_id'
      )
      .andWhere('answers.question_id', questionFilter.questionId)
      .modify(questionFilterQuery, questionFilter);

    return query;
  }

  async getProposalsFromView(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: PaginationSortDirection,
    searchText?: string,
    principleInvestigator?: number[]
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }> {
    const principalInvestigator = principleInvestigator
      ? principleInvestigator
      : [];

    return database
      .select([
        '*',
        database.raw("instruments->0->'name' AS instrument_name"),
        database.raw(
          "instruments->0->'managementTimeAllocation' AS instrument_management_time_allocation"
        ),
        database.raw(
          "technical_reviews->0->'status' AS technical_review_status"
        ),
        database.raw(
          "technical_reviews->0->'timeAllocation' AS technical_review_time_allocation"
        ),
        database.raw(
          "technical_reviews->0->'technicalReviewAssignee'->'firstname' AS technical_review_assignee"
        ),
        database.raw("faps->0->'code' AS fap_code"),
        database.raw('count(*) OVER() AS full_count'),
      ])
      .from('proposal_table_view')
      .join(
        'users',
        'users.user_id',
        '=',
        'proposal_table_view.principal_investigator'
      )
      .modify((query) => {
        if (filter?.callId) {
          query.where('call_id', filter?.callId);
        }

        if (filter?.instrumentFilter?.showMultiInstrumentProposals) {
          query.whereRaw('jsonb_array_length(instruments) > 1');
        } else if (filter?.instrumentFilter?.instrumentId) {
          // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with id equal to filter.instrumentId
          query.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].id \\? (@.type() == "number" && @ == :instrumentId:)\')',
            { instrumentId: filter.instrumentFilter.instrumentId }
          );
        }

        if (filter?.proposalStatusId) {
          query.where('proposal_status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }
        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }
        if (
          searchText !== '' &&
          searchText !== null &&
          searchText !== undefined
        ) {
          query.andWhere((qb) =>
            qb
              .orWhereRaw('proposal_id ILIKE ?', [`%${searchText}%`])
              .orWhereRaw('title ILIKE ?', [`%${searchText}%`])
              .orWhereRaw('proposal_status_name ILIKE ?', [`%${searchText}%`])
              .orWhere('users.email', 'ilike', `%${searchText}%`)
              .orWhere('users.firstname', 'ilike', `%${searchText}%`)
              .orWhere('users.lastname', 'ilike', `%${searchText}%`)
              .orWhere('principal_investigator', 'in', principalInvestigator)
              .orWhereJsonFieldLikeEscaped(
                'instruments',
                'name',
                `${searchText}`
              )
          );
        }

        if (sortField && sortDirection) {
          if (!fieldMap.hasOwnProperty(sortField)) {
            throw new GraphQLError(`Bad sort field given: ${sortField}`);
          }
          sortField = fieldMap[sortField];
          query.orderBy(sortField, sortDirection);
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposal_id', filter.referenceNumbers);
        }
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposalViews: props,
        };
      });
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(['proposals.*', database.raw('count(*) OVER() AS full_count')])
      .from('proposals')
      .orderBy('proposals.proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }

        if (filter?.questionaryIds) {
          query.whereIn('proposals.questionary_id', filter.questionaryIds);
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
        }

        if (filter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_pk',
              'proposals.proposal_pk'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentId
            );
        }

        if (filter?.instrumentFilter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_pk',
              'proposals.proposal_pk'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentFilter.instrumentId
            );
        }

        if (filter?.templateIds) {
          query
            .leftJoin(
              'questionaries',
              'questionaries.questionary_id',
              'proposals.questionary_id'
            )
            .whereIn('questionaries.template_id', filter.templateIds);
        }

        if (filter?.proposalStatusId) {
          query.where('proposals.status_id', filter?.proposalStatusId);
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

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getInstrumentScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .join(
        'users',
        'users.user_id',
        '=',
        'proposal_table_view.principal_investigator'
      )
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
          // NOTE: Using jsonpath we check the jsonb (technical_reviews) field if it contains internalReviewers array of objects with id equal to user.id
          this.whereRaw(
            'jsonb_path_exists(technical_reviews, \'$[*].internalReviewers[*].id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        } else {
          this.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].scientists[*].id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          ).orWhereRaw(
            'jsonb_path_exists(instruments, \'$[*].managerUserId \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        }
      })
      .distinct('proposal_pk')
      .orderBy('proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query.andWhere((qb) =>
            qb
              .orWhereRaw('title ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('proposal_id ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('proposal_status_name ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('users.email ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('users.firstname ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('users.lastname ILIKE ?', `%${filter.text}%`)
              .orWhereJsonFieldLikeEscaped(
                'instruments',
                'name',
                `${filter.text}`
              )
          );
        }
        if (filter?.callId) {
          query.where('call_id', filter.callId);
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          // NOTE: Using jsonpath we check the jsonb (technical_reviews) field if it contains object with id equal to user.id
          query.where(function () {
            this.whereRaw(
              'jsonb_path_exists(technical_reviews, \'$[*].technicalReviewAssignee.id \\? (@.type() == "number" && @ == :userId:)\')',
              { userId: user.id }
            ).orWhereRaw(
              // This query finds proposals where the current user is a scientist on an instrument that allows multiple technical reviews
              // eslint-disable-next-line prettier/prettier
              "jsonb_path_exists(instruments, '$[*] \\? (@.multipleTechReviewsEnabled == true && @.scientists[*].id == :userId:)')",
              { userId: user.id }
            );
          });
        }

        if (filter?.instrumentFilter?.showMultiInstrumentProposals) {
          query.whereRaw('jsonb_array_length(instruments) > 1');
        } else if (filter?.instrumentFilter?.instrumentId) {
          // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with id equal to filter.instrumentId
          query.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].id \\? (@.type() == "number" && @ == :instrumentId:)\')',
            { instrumentId: filter.instrumentFilter?.instrumentId }
          );
        }

        if (filter?.proposalStatusId) {
          query.where('proposal_status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposal_id', filter.referenceNumbers);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getUserProposals(
    id: number,
    filter?: UserProposalsFilter
  ): Promise<Proposal[]> {
    return (
      database
        .select('p.*')
        .from('proposals as p')
        .where('p.proposer_id', id) // Principal investigator
        .orWhereIn('p.proposal_pk', function () {
          // co-proposer
          this.select('proposal_pk').from('proposal_user').where('user_id', id);
        })
        // data access
        .orWhereIn('p.proposal_pk', function () {
          this.select('proposal_pk')
            .from('data_access_user_has_proposal')
            .where('user_id', id);
        })
        .orWhereIn('p.proposal_pk', function () {
          // visitor
          this.select('proposal_pk')
            .from('visits')
            .leftJoin(
              'visits_has_users',
              'visits.visit_id',
              'visits_has_users.visit_id'
            )
            .where('visits_has_users.user_id', id);
        })
        .modify((qb) => {
          if (filter?.instrumentId) {
            qb.innerJoin('instrument_has_proposals as ihp', {
              'p.proposal_pk': 'ihp.proposal_pk',
            });
            qb.where('ihp.instrument_id', filter.instrumentId);
          }

          if (filter?.managementDecisionSubmitted) {
            qb.where(
              'p.management_decision_submitted',
              filter.managementDecisionSubmitted
            );
          }

          if (filter?.finalStatus) {
            qb.where('p.final_status', filter.finalStatus);
          }
        })
        .groupBy('p.proposal_pk')
        .then((proposals: ProposalRecord[]) =>
          proposals.map((proposal) => createProposalObject(proposal))
        )
    );
  }

  async getProposalsByPks(proposalPks: number[]): Promise<Proposal[]> {
    return database('proposals')
      .whereIn('proposal_pk', proposalPks)
      .then((proposals: ProposalRecord[]) =>
        proposals.map((proposal) => createProposalObject(proposal))
      );
  }

  getProposalByVisitId(visitId: number): Promise<Proposal> {
    return database
      .select('p.*')
      .from('visits as v')
      .join('proposals as p', 'v.proposal_pk', 'p.proposal_pk')
      .where('v.visit_id', visitId)
      .first()
      .then((proposal) => createProposalObject(proposal));
  }

  async getCount(callId: number): Promise<number> {
    return database('proposals')
      .count('call_id')
      .where('call_id', callId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async cloneProposal(sourceProposal: Proposal, call: Call): Promise<Proposal> {
    const [newProposal]: ProposalRecord[] = (
      await database.raw(`
          INSERT INTO proposals
          (title,
           abstract,
           status_id,
           workflow_status_id,
           proposer_id,
           created_at,
           updated_at,
           final_status,
           call_id,
           questionary_id,
           comment_for_management,
           comment_for_user,
           notified,
           submitted,
           management_decision_submitted)
          SELECT title,
                 abstract,
                 status_id,
                 workflow_status_id,
                 proposer_id,
                 created_at,
                 updated_at,
                 final_status,
                 call_id,
                 questionary_id,
                 comment_for_management,
                 comment_for_user,
                 notified,
                 submitted,
                 management_decision_submitted
          FROM proposals
          WHERE proposal_pk = ${sourceProposal.primaryKey} RETURNING *
      `)
    ).rows;

    return createProposalObject(newProposal);
  }

  async changeProposalsWorkflowStatus(
    workflowStatusId: number,
    proposalPks: number[]
  ): Promise<Proposals> {
    const workflowStatus =
      await this.workflowDataSource.getWorkflowStatus(workflowStatusId);

    // NOTE: If status is DRAFT re-open the proposal for submission
    const dataToUpdate: Partial<ProposalRecord> = {
      workflow_status_id: workflowStatusId,
      submitted: workflowStatus?.statusId === 'DRAFT' ? false : undefined,
    };

    const result: ProposalRecord[] = await database
      .update(dataToUpdate, ['*'])
      .from('proposals')
      .whereIn('proposal_pk', proposalPks);

    if (result?.length === 0) {
      logger.logError('Could not change proposals status', { dataToUpdate });

      throw new GraphQLError('Could not change proposals status');
    }

    return new Proposals(result.map((item) => createProposalObject(item)));
  }

  async getRelatedUsersOnProposals(id: number): Promise<number[]> {
    const relatedCoIs = await database
      .select('ou.user_id')
      .distinct()
      .from('proposals as p')
      .leftJoin('proposal_user as u', function () {
        this.on('u.proposal_pk', 'p.proposal_pk');
        this.andOn(function () {
          this.onVal('u.user_id', id); // user is on the proposal
          this.orOnVal('p.proposer_id', id); // user is the proposal PI
        });
      }) // this gives a list of proposals that a user is related to
      .join('proposal_user as ou', { 'ou.proposal_pk': 'u.proposal_pk' }); // this gives us all of the associated coIs

    const relatedPis = await database
      .select('p.proposer_id')
      .distinct()
      .from('proposals as p')
      .leftJoin('proposal_user as u', {
        'u.proposal_pk': 'p.proposal_pk',
        'u.user_id': id,
      }); // this gives a list of proposals that a user is related to

    const relatedUsers = [
      ...relatedCoIs.map((r) => r.user_id),
      ...relatedPis.map((r) => r.proposer_id),
    ];

    return relatedUsers;
  }

  async getProposalById(proposalId: string): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('proposal_id', proposalId)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async doesProposalNeedTechReview(proposalPk: number): Promise<boolean> {
    const workflowStatus = (
      await this.adminDataSource.getSetting(
        SettingsId.TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS
      )
    )?.settingsValue;

    if (!workflowStatus) {
      return true;
    }

    const proposalWorkflowId: number = await database
      .select('c.proposal_workflow_id')
      .from('proposals as p')
      .join('call as c', { 'p.call_id': 'c.call_id' })
      .where('proposal_pk', proposalPk)
      .first()
      .then((value) => value.proposal_workflow_id);

    const proposalStatus = await database<WorkflowStatusRecord>(
      'workflow_has_statuses'
    ).where('workflow_id', proposalWorkflowId);

    return !!proposalStatus.find((status) =>
      status.status_id.match(workflowStatus)
    );
  }

  createTechniqueObject(technique: TechniqueRecord): Technique {
    return new Technique(
      technique.technique_id,
      technique.name,
      technique.short_code,
      technique.description
    );
  }

  async getTechniqueScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: PaginationSortDirection,
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
          filter?.dateFilter?.from != null &&
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
          filter?.dateFilter?.to != null &&
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

  async submitImportedProposal(
    primaryKey: number,
    referenceNumber: string,
    submittedDate: Date
  ): Promise<Proposal | null> {
    await this.submitProposal(primaryKey, referenceNumber);

    const proposal: ProposalRecord[] | undefined = await database
      .from('proposals')
      .where('proposal_pk', primaryKey)
      .update({ submitted_date: submittedDate })
      .returning('*');

    return proposal ? createProposalObject(proposal[0]) : null;
  }

  async getInvitedProposal(inviteId: number): Promise<InvitedProposal | null> {
    const proposals: InvitedProposalRecord[] | undefined = await database
      .select(
        'proposals.proposal_id',
        'proposer.firstname as proposer_name',
        'proposals.abstract',
        'proposals.title'
      )
      .from('co_proposer_claims')
      .join('proposals', {
        'co_proposer_claims.proposal_pk': 'proposals.proposal_pk',
      })
      .join('users as proposer', {
        'proposals.proposer_id': 'proposer.user_id',
      })
      .where('invite_id', inviteId);

    return proposals ? createInvitedProposalObject(proposals[0]) : null;
  }
}
