/* eslint-disable @typescript-eslint/camelcase */
import 'reflect-metadata';
import { EvaluatorOperator } from '../../models/ConditionEvaluator';
import { Proposal } from '../../models/Proposal';
import {
  Answer,
  ProposalStatus,
  ProposalTemplate,
  Questionary,
  QuestionaryStep,
  Topic,
  DataType,
  createConfig,
  FieldDependency,
  FieldCondition,
  Question,
  TemplateStep,
  QuestionRel,
} from '../../models/ProposalModel';
import {
  EmbellishmentConfig,
  SelectionFromOptionsConfig,
  TextInputConfig,
  FieldConfigType,
} from '../../resolvers/types/FieldConfig';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';

export let dummyTemplate: ProposalTemplate;
export let dummyQuestionary: Questionary;
export let dummyProposal: Proposal;
export let dummyProposalSubmitted: Proposal;
export let dummyAnswers: Answer[];

const createDummyQuestion = (values: {
  proposal_question_id?: string;
  natural_key?: string;
  data_type?: DataType;
  question?: string;
  config?: typeof FieldConfigType;
}): Question => {
  return new Question(
    values.proposal_question_id || 'random_field_name_' + Math.random(),
    values.natural_key || 'is_dangerous',
    values.data_type || DataType.TEXT_INPUT,
    values.question || 'Some random question',
    values.config || { required: false, tooltip: '', small_label: '' }
  );
};

const createDummyQuestionRel = (values: {
  question?: Question;
  sort_order?: number;
  topic_id?: number;
  dependency?: FieldDependency;
}): QuestionRel => {
  return new QuestionRel(
    values.question || createDummyQuestion({}),
    values.sort_order || Math.round(Math.random() * 100),
    values.topic_id || Math.round(Math.random() * 10),
    values.dependency || undefined
  );
};

const create1Topic3FieldWithDependenciesQuestionary = () => {
  return new Questionary([
    new QuestionaryStep(new Topic(0, 'General information', 0, true), false, [
      new Answer(
        createDummyQuestionRel({
          question: createDummyQuestion({
            proposal_question_id: 'ttl_general',
            natural_key: 'ttl_general',
            data_type: DataType.EMBELLISHMENT,
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
        createDummyQuestionRel({
          question: createDummyQuestion({
            proposal_question_id: 'has_links_with_industry',
            natural_key: 'has_links_with_industry',
            data_type: DataType.SELECTION_FROM_OPTIONS,
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
        createDummyQuestionRel({
          question: createDummyQuestion({
            proposal_question_id: 'links_with_industry',
            natural_key: 'links_with_industry',
            data_type: DataType.TEXT_INPUT,
            config: createConfig<TextInputConfig>(new TextInputConfig(), {
              placeholder: 'Please specify links with industry',
              multiline: true,
            }),
          }),
          dependency: new FieldDependency(
            'links_with_industry',
            'has_links_with_industry',
            'has_links_with_industry',
            new FieldCondition(EvaluatorOperator.EQ, 'yes')
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
      1
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
      1
    );
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return dummyProposal;
  }

  async updateTopicCompletenesses(
    id: number,
    topicsCompleted: number[]
  ): Promise<void> {
    // Do something here or remove the function
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
    return questionId;
  }

  async checkActiveCall(callId: number): Promise<boolean> {
    return true;
  }

  async rejectProposal(id: number): Promise<Proposal> {
    if (id && id > 0) {
      return dummyProposal;
    }
    throw new Error('Wrong ID');
  }

  async update(proposal: Proposal): Promise<Proposal> {
    if (proposal.id && proposal.id > 0) {
      if (proposal.id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }
    throw new Error('Error');
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    // Do something here or remove the function
  }

  async acceptProposal(id: number): Promise<Proposal> {
    if (id && id > 0) {
      return dummyProposal;
    }
    throw new Error('Wrong ID');
  }

  async submitProposal(id: number): Promise<Proposal> {
    if (id && id > 0) {
      return dummyProposal;
    }
    throw new Error('Wrong ID');
  }

  async get(id: number) {
    if (id && id > 0) {
      if (id == dummyProposalSubmitted.id) {
        return dummyProposalSubmitted;
      } else {
        return dummyProposal;
      }
    }

    return null;
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
