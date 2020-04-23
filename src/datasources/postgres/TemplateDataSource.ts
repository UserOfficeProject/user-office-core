/* eslint-disable @typescript-eslint/camelcase */
import to from 'await-to-js';

import {
  DataType,
  ProposalTemplate,
  TemplateStep,
  Topic,
} from '../../models/ProposalModel';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionRelArgs } from '../../resolvers/mutations/DeleteQuestionRelMutation';
import { UpdateProposalTemplateArgs } from '../../resolvers/mutations/UpdateProposalTemplateMutation';
import { FieldDependencyInput } from '../../resolvers/mutations/UpdateQuestionRelMutation';
import { TemplateDataSource } from '../TemplateDataSource';
import { Question, QuestionRel } from './../../models/ProposalModel';
import { logger } from './../../utils/Logger';
import database from './database';
import {
  createProposalTemplateObject,
  createQuestionObject,
  createQuestionRelObject,
  createTopicObject,
  ProposalQuestionProposalTemplateRelRecord,
  ProposalQuestionRecord,
  ProposalTemplateRecord,
  TopicRecord,
} from './records';

export default class PostgresTemplateDataSource implements TemplateDataSource {
  async createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplate> {
    return database('proposal_templates')
      .insert({
        name,
        description,
      })
      .returning('*')
      .then((rows: ProposalTemplateRecord[]) => {
        if (rows.length !== 1) {
          throw new Error(
            `createTemplate expected 1 result got ${rows.length}. ${name} ${description}`
          );
        }

        return createProposalTemplateObject(rows[0]);
      });
  }

  async deleteTemplate(templateId: number): Promise<ProposalTemplate> {
    return database('proposal_templates')
      .delete()
      .where({ template_id: templateId })
      .returning('*')
      .then((resultSet: ProposalTemplateRecord[]) => {
        if (!resultSet || resultSet.length == 0) {
          throw new Error(
            `DeleteTemplate template does not exist. ID: ${templateId}`
          );
        }

        return createProposalTemplateObject(resultSet[0]);
      });
  }

  async getProposalTemplates(
    isArchived?: boolean
  ): Promise<ProposalTemplate[]> {
    return database('proposal_templates')
      .select('*')
      .where({ is_archived: isArchived || false })
      .then((resultSet: ProposalTemplateRecord[]) => {
        if (!resultSet) {
          return [];
        }

        return resultSet.map(value => createProposalTemplateObject(value));
      });
  }

  async getProposalTemplate(templateId: number) {
    return database('proposal_templates')
      .select('*')
      .where({ template_id: templateId })
      .then((resultSet: ProposalTemplateRecord[]) => {
        if (resultSet.length !== 1) {
          return null;
        }

        return createProposalTemplateObject(resultSet[0]);
      });
  }

  async getProposalTemplateSteps(templateId: number): Promise<TemplateStep[]> {
    const topicRecords: TopicRecord[] = await database
      .select('*')
      .from('proposal_topics')
      .where('template_id', templateId)
      .andWhere('is_enabled', true)
      .orderBy('sort_order');

    const questionRecords: Array<ProposalQuestionRecord &
      ProposalQuestionProposalTemplateRelRecord> = (
      await database.raw(`
      SELECT 
        proposal_question__proposal_template__rels.*, proposal_questions.*
      FROM 
        proposal_question__proposal_template__rels
      LEFT JOIN
        proposal_questions 
      ON 
        proposal_question__proposal_template__rels.proposal_question_id = 
        proposal_questions.proposal_question_id
      ORDER BY
       proposal_question__proposal_template__rels.sort_order`)
    ).rows;

    const fields = questionRecords.map(record =>
      createQuestionRelObject(record)
    );

    const steps = Array<TemplateStep>();
    topicRecords.forEach(topic => {
      steps.push(
        new TemplateStep(
          createTopicObject(topic),
          fields.filter(field => field.topicId === topic.topic_id)
        )
      );
    });

    return steps;
  }

  async createTopic(args: CreateTopicArgs): Promise<TemplateStep[]> {
    await database('proposal_topics')
      .update({ sort_order: args.sortOrder + 1 })
      .where('sort_order', '>=', args.sortOrder);

    await database('proposal_topics').insert({
      topic_title: 'New Topic',
      sort_order: args.sortOrder,
      is_enabled: true,
      template_id: args.templateId,
    });

    return this.getProposalTemplateSteps(args.templateId);
  }

  async updateTopic(
    topicId: number,
    values: {
      title?: string;
      isEnabled?: boolean;
      sortOrder?: number;
    }
  ): Promise<Topic> {
    const resultSet: TopicRecord[] = await database
      .update(
        {
          topic_title: values.title,
          is_enabled: values.isEnabled,
          sortOrder: values.sortOrder,
        },
        ['*']
      )
      .from('proposal_topics')
      .where({ topic_id: topicId });

    if (!resultSet || resultSet.length != 1) {
      throw new Error('INSERT Topic resultSet must contain exactly 1 row');
    }

    return createTopicObject(resultSet[0]);
  }

  async updateQuestion(
    fieldId: string,
    values: {
      naturalKey?: string;
      dataType?: string;
      question?: string;
      config?: string;
    }
  ): Promise<Question> {
    const rows = {
      natural_key: values.naturalKey,
      data_type: values.dataType,
      question: values.question,
      config: values.config,
    };

    await database
      .update(rows, ['*'])
      .from('proposal_questions')
      .where('proposal_question_id', fieldId);

    const question = await this.getQuestion(fieldId);
    if (!question) {
      throw new Error('Could not update field');
    }

    return question;
  }

  async updateQuestionRel(
    questionId: string,
    templateId: number,
    values: {
      topicId?: number;
      sortOrder?: number;
      dependency?: FieldDependencyInput;
    }
  ): Promise<TemplateStep[]> {
    await to(
      database('proposal_question__proposal_template__rels')
        .where({ proposal_question_id: questionId, template_id: templateId })
        .del()
    );

    await database('proposal_question__proposal_template__rels').insert({
      proposal_question_id: questionId,
      template_id: templateId,
      topic_id: values.topicId,
      sort_order: values.sortOrder,
      dependency_proposal_question_id: values.dependency?.dependencyId,
      dependency_condition: values.dependency?.condition,
    });

    return this.getProposalTemplateSteps(templateId);
  }

  async updateTemplate(
    values: UpdateProposalTemplateArgs
  ): Promise<ProposalTemplate | null> {
    await database('proposal_templates')
      .update({
        name: values.name,
        description: values.description,
        is_archived: values.isArchived,
      })
      .where({ template_id: values.templateId });

    return this.getProposalTemplate(values.templateId);
  }

  async createQuestionAndRel(
    templateId: number,
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ) {
    await this.createQuestion(fieldId, naturalKey, dataType, question, config);

    await database('proposal_question__proposal_template__rels').insert(
      {
        proposal_question_id: fieldId,
        template_id: templateId,
        topic_id: topicId,
      },
      ['*']
    );

    return this.getProposalTemplateSteps(templateId);
  }

  async createQuestion(
    fieldId: string,
    naturalKey: string,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<Question> {
    const resultSet: ProposalQuestionRecord[] = await database
      .insert(
        {
          proposal_question_id: fieldId,
          natural_key: naturalKey,
          data_type: dataType,
          question: question,
          config: config,
        },
        ['*']
      )
      .from('proposal_questions');

    if (!resultSet || resultSet.length != 1) {
      throw new Error('INSERT field resultSet must contain exactly 1 row');
    }

    return createQuestionObject(resultSet[0]);
  }

  async createQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<TemplateStep[]> {
    await database('proposal_question__proposal_template__rels').insert({
      proposal_question_id: fieldId,
      template_id: templateId,
    });

    return this.getProposalTemplateSteps(templateId);
  }

  async getQuestion(fieldId: string): Promise<Question | null> {
    return database('proposal_questions')
      .where({ proposal_question_id: fieldId })
      .select('*')
      .then((resultSet: ProposalQuestionRecord[]) => {
        if (!resultSet || resultSet.length === 0) {
          return null;
        }

        return createQuestionObject(resultSet[0]);
      });
  }

  async getQuestionRel(
    fieldId: string,
    templateId: number
  ): Promise<QuestionRel | null> {
    return database('proposal_question__proposal_template__rels')
      .where({
        'proposal_question__proposal_template__rels.proposal_question_id': fieldId,
      })
      .andWhere({
        'proposal_question__proposal_template__rels.template_id': templateId,
      })
      .leftJoin(
        'proposal_questions',
        'proposal_question__proposal_template__rels.proposal_question_id',
        'proposal_questions.proposal_question_id'
      )
      .select('*')
      .then(
        (
          resultSet: Array<
            ProposalQuestionProposalTemplateRelRecord & ProposalQuestionRecord
          >
        ) => {
          if (!resultSet || resultSet.length !== 1) {
            return null;
          }

          return createQuestionRelObject(resultSet[0]);
        }
      );
  }

  async deleteQuestion(fieldId: string): Promise<Question> {
    const [error, row] = await to(
      database('proposal_questions')
        .where({ proposal_question_id: fieldId })
        .returning('*')
        .del()
    );
    if (error || row?.length !== 1) {
      logger.logError('Could not delete question', { fieldId });
      throw new Error(`Could not delete question ${fieldId}`);
    }

    return createQuestionObject(row[0]);
  }

  async deleteQuestionRel(
    args: DeleteQuestionRelArgs
  ): Promise<TemplateStep[]> {
    const rowsAffected = await database(
      'proposal_question__proposal_template__rels'
    )
      .where({
        template_id: args.templateId,
        proposal_question_id: args.questionId,
      })
      .del();

    if (rowsAffected !== 1) {
      throw new Error(
        `Could not delete questionId ${args.questionId} in templateId:${args.templateId}`
      );
    }

    return this.getProposalTemplateSteps(args.templateId);
  }

  async deleteTopic(id: number): Promise<Topic> {
    return database('proposal_topics')
      .where({ topic_id: id })
      .del(['*'])
      .then((result: TopicRecord[]) => {
        if (!result || result.length !== 1) {
          throw new Error(`Could not delete topic ${id}`);
        }

        return createTopicObject(result[0]);
      });
  }

  async updateTopicOrder(topicOrder: number[]): Promise<number[]> {
    topicOrder.forEach(async (topicId, index) => {
      return database('proposal_topics')
        .update({ sort_order: index })
        .where({ topic_id: topicId });
    });

    return topicOrder;
  }

  isNaturalKeyPresent(natural_key: string): Promise<boolean> {
    return database('proposal_questions')
      .where({ natural_key })
      .select('natural_key')
      .then((result: []) => result.length > 0);
  }

  async cloneTemplate(templateId: number) {
    const sourceTemplate = await this.getProposalTemplate(templateId);

    if (!sourceTemplate) {
      logger.logError(
        'Could not clone template because source template does not exist',
        { templateId }
      );

      throw new Error('Could not clone template');
    }
    const newTemplate = await this.createTemplate(
      sourceTemplate.name,
      sourceTemplate.description
    );

    // Clone topics
    await database.raw(`
      INSERT INTO proposal_topics(
            topic_title
          , is_enabled
          , sort_order
          , template_id
      )
      SELECT 
            topic_title
          , is_enabled
          , sort_order
          , ${newTemplate.templateId}
      FROM 
          proposal_topics
      WHERE
          template_id=${sourceTemplate.templateId}
    `);

    // Clone proposal_question__proposal_template__rels entries
    await database.raw(`
      INSERT INTO proposal_question__proposal_template__rels 
                  (template_id, 
                  proposal_question_id, 
                  sort_order, 
                  dependency_proposal_question_id, 
                  dependency_condition, 
                  topic_id) 
      SELECT ${newTemplate.templateId}, 
            proposal_question_id, 
            sort_order, 
            dependency_proposal_question_id, 
            dependency_condition, 
            (SELECT topic_id 
              FROM   proposal_topics AS newTopics 
              WHERE  template_id = ${sourceTemplate.templateId} 
                    AND sort_order = (SELECT sort_order 
                                      FROM   proposal_topics 
                                      WHERE  topic_id = source.topic_id)) 
      FROM   questions_proposal_template AS source 
    `);

    return newTemplate;
  }
}
