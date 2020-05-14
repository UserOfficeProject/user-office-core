/* eslint-disable @typescript-eslint/camelcase */
import 'reflect-metadata';
import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { Proposal } from '../../models/Proposal';
import {
  Answer,
  createConfig,
  DataType,
  FieldCondition,
  FieldDependency,
  ProposalStatus,
  Question,
  Questionary,
  QuestionaryStep,
  QuestionRel,
  Topic,
  ProposalEndStatus,
} from '../../models/ProposalModel';
import {
  EmbellishmentConfig,
  FieldConfigType,
  SelectionFromOptionsConfig,
  TextInputConfig,
  BooleanConfig,
} from '../../resolvers/types/FieldConfig';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';

export let dummyProposal: Proposal;
export let dummyQuestionary: Questionary;
export let dummyProposalSubmitted: Proposal;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export const dummyConfigFactory = (values?: any): typeof FieldConfigType => {
  return {
    required: true,
    small_label: 'small_label',
    tooltip: 'tooltip',
    ...values,
  };
};
export const dummyQuestionFactory = (
  values?: DeepPartial<Question>
): Question => {
  return new Question(
    values?.proposalQuestionId || 'random_field_name_' + Math.random(),
    values?.naturalKey || 'is_dangerous',
    values?.dataType || DataType.TEXT_INPUT,
    values?.question || 'Some random question',
    (values?.config as any) || dummyConfigFactory()
  );
};

export const dummyQuestionRelFactory = (
  values?: DeepPartial<QuestionRel>
): QuestionRel => {
  return new QuestionRel(
    dummyQuestionFactory(values?.question),
    values?.sortOrder || Math.round(Math.random() * 100),
    values?.topicId || Math.round(Math.random() * 10),
    new BooleanConfig()
  );
};

const dummyProposalFactory = (values?: Partial<Proposal>) => {
  return new Proposal(
    values?.id || 1,
    values?.title || 'title',
    values?.abstract || 'abstract',
    values?.proposerId || 1,
    values?.status || ProposalStatus.DRAFT,
    values?.created || new Date(),
    values?.updated || new Date(),
    values?.shortCode || 'shortCode',
    values?.rankOrder || 0,
    values?.finalStatus || 0,
    values?.callId || 0,
    values?.templateId || 1,
    values?.commentForUser || 'comment for user',
    values?.commentForManagement || 'comment for management'
  );
};

const create1Topic3FieldWithDependenciesQuestionary = () => {
  return new Questionary([
    new QuestionaryStep(new Topic(0, 'General information', 0, true), false, [
      new Answer(
        dummyQuestionRelFactory({
          question: dummyQuestionFactory({
            proposalQuestionId: 'ttl_general',
            naturalKey: 'ttl_general',
            dataType: DataType.EMBELLISHMENT,
            config: createConfig<EmbellishmentConfig>(
              new EmbellishmentConfig(),
              {
                plain: 'General information',
                html: '<h1>General information</h1>',
              }
            ),
          }),
        }),
        null
      ),

      new Answer(
        dummyQuestionRelFactory({
          question: dummyQuestionFactory({
            proposalQuestionId: 'has_links_with_industry',
            naturalKey: 'has_links_with_industry',
            dataType: DataType.SELECTION_FROM_OPTIONS,
            config: createConfig<SelectionFromOptionsConfig>(
              new SelectionFromOptionsConfig(),
              {
                options: ['yes', 'no'],
                variant: 'radio',
              }
            ),
          }),
        }),
        'yes'
      ),

      new Answer(
        dummyQuestionRelFactory({
          question: dummyQuestionFactory({
            proposalQuestionId: 'links_with_industry',
            naturalKey: 'links_with_industry',
            dataType: DataType.TEXT_INPUT,
            config: createConfig<TextInputConfig>(new TextInputConfig(), {
              placeholder: 'Please specify links with industry',
              multiline: true,
            }),
          }),
          dependency: new FieldDependency(
            'links_with_industry',
            'has_links_with_industry',
            'has_links_with_industry',
            new FieldCondition(EvaluatorOperator.eq, 'yes')
          ),
        }),
        'https://example.com'
      ),
    ]),
  ]);
};
export class ProposalDataSourceMock implements ProposalDataSource {
  getEmptyQuestionary(callId: number): Promise<Questionary> {
    throw new Error('Method not implemented.');
  }
  public init() {
    dummyQuestionary = create1Topic3FieldWithDependenciesQuestionary();

    dummyProposal = new Proposal(
      1,
      'title',
      'abstract',
      1, // main proposer
      ProposalStatus.DRAFT, // status
      new Date('2019-07-17 08:25:12.23043+00'),
      new Date('2019-07-17 08:25:12.23043+00'),
      'GQX639',
      1,
      1,
      1,
      1,
      '',
      ''
    );

    dummyProposalSubmitted = new Proposal(
      2,
      'submitted proposal',
      'abstract',
      1, // main proposer
      ProposalStatus.SUBMITTED, // status
      new Date('2019-07-17 08:25:12.23043+00'),
      new Date('2019-07-17 08:25:12.23043+00'),
      'GQX639',
      1,
      1,
      1,
      1,
      '',
      ''
    );
  }

  async deleteProposal(id: number): Promise<Proposal> {
    const dummyProposalRef = dummyProposalFactory(dummyProposal);
    dummyProposal.id = -1; // hacky

    return dummyProposalRef;
  }

  async updateTopicCompletenesses(
    id: number,
    topicsCompleted: number[]
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async getQuestionary(proposalId: number): Promise<Questionary> {
    return dummyQuestionary;
  }

  async insertFiles(
    proposalId: number,
    questionId: string,
    files: string[]
  ): Promise<string[]> {
    return files;
  }

  async deleteFiles(proposalId: number, questionId: string): Promise<string[]> {
    return ['file_id_012345'];
  }

  async updateAnswer(
    proposalId: number,
    questionId: string,
    answer: string
  ): Promise<string> {
    if (dummyProposal.id !== proposalId) {
      throw new Error('Wrong ID');
    }
    const updated = dummyQuestionary.steps.some(step =>
      step.fields.some(field => {
        if (field.question.proposalQuestionId === questionId) {
          field.value = answer;

          return true;
        }

        return false;
      })
    );
    if (!updated) {
      throw new Error('Question not found');
    }

    return questionId;
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
    dummyProposal.status = ProposalStatus.SUBMITTED;

    return dummyProposal;
  }

  async get(id: number) {
    return id === dummyProposal.id ? dummyProposal : null;
  }

  async create(proposerID: number, callID: number, templateId: number) {
    dummyProposal.proposerId = proposerID;
    dummyProposal.callId = callID;
    dummyProposal.templateId = templateId;

    return dummyProposal;
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return { totalCount: 1, proposals: [dummyProposal] };
  }

  async getUserProposals(id: number) {
    return [dummyProposal];
  }
}
