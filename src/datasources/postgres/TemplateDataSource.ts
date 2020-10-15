/* eslint-disable @typescript-eslint/camelcase */
import to from 'await-to-js';

import {
  DataType,
  Template,
  TemplateCategory,
  TemplateCategoryId,
  TemplateStep,
  Topic,
} from '../../models/Template';
import { Question, QuestionTemplateRelation } from '../../models/Template';
import { CreateQuestionTemplateRelationArgs } from '../../resolvers/mutations/CreateQuestionTemplateRelationMutation';
import { CreateTemplateArgs } from '../../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { UpdateQuestionTemplateRelationArgs } from '../../resolvers/mutations/UpdateQuestionTemplateRelationMutation';
import { UpdateTemplateArgs } from '../../resolvers/mutations/UpdateTemplateMutation';
import { TemplatesArgs } from '../../resolvers/queries/TemplatesQuery';
import { TemplateDataSource } from '../TemplateDataSource';
import { logger } from './../../utils/Logger';
import database from './database';
import {
  createProposalTemplateObject,
  createQuestionObject,
  createQuestionTemplateRelationObject,
  createTemplateCategoryObject,
  createTopicObject,
  QuestionRecord,
  QuestionTemplateRelRecord,
  TemplateCategoryRecord,
  TemplateRecord,
  TopicRecord,
} from './records';

export default class PostgresTemplateDataSource implements TemplateDataSource {
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return database('template_categories')
      .select('*')
      .then((records: TemplateCategoryRecord[]) =>
        records.map(record => createTemplateCategoryObject(record))
      );
  }
  async getComplementaryQuestions(
    templateId: number
  ): Promise<Question[] | null> {
    const questionRecords: QuestionRecord[] = (
      await database.raw(
        `
        SELECT *
        FROM questions AS questions
        WHERE question_id NOT IN
            (SELECT question_id
             FROM templates_has_questions
             WHERE template_id = ${templateId}
             )
        AND category_id = 
            (SELECT category_id
              FROM templates 
              WHERE template_id = ${templateId})
        `
      )
    ).rows;

    if (!questionRecords) {
      return [];
    }

    return questionRecords.map(value => createQuestionObject(value));
  }

  async createTemplate(args: CreateTemplateArgs): Promise<Template> {
    return database('templates')
      .insert({
        category_id: args.categoryId,
        name: args.name,
        description: args.description,
      })
      .returning('*')
      .then((rows: TemplateRecord[]) => {
        if (rows.length !== 1) {
          throw new Error(
            `createTemplate expected 1 result got ${rows.length}. ${args.name} ${args.description}`
          );
        }

        return createProposalTemplateObject(rows[0]);
      });
  }

  async deleteTemplate(templateId: number): Promise<Template> {
    return database('templates')
      .delete()
      .where({ template_id: templateId })
      .returning('*')
      .then((resultSet: TemplateRecord[]) => {
        if (!resultSet || resultSet.length == 0) {
          throw new Error(
            `DeleteTemplate template does not exist. ID: ${templateId}`
          );
        }

        return createProposalTemplateObject(resultSet[0]);
      });
  }

  async getTemplates(args: TemplatesArgs): Promise<Template[]> {
    return database('templates')
      .select('*')
      .where({ is_archived: args.filter?.isArchived || false })
      .modify(query => {
        if (args.filter?.category) {
          query.where({ category_id: args.filter?.category || undefined });
        }
      })
      .then((resultSet: TemplateRecord[]) => {
        if (!resultSet) {
          return [];
        }

        return resultSet.map(value => createProposalTemplateObject(value));
      });
  }

  async getTemplate(templateId: number) {
    return database('templates')
      .select('*')
      .where({ template_id: templateId })
      .then((resultSet: TemplateRecord[]) => {
        if (resultSet.length !== 1) {
          return null;
        }

        return createProposalTemplateObject(resultSet[0]);
      });
  }

  async getTemplateSteps(templateId: number): Promise<TemplateStep[]> {
    const topicRecords: TopicRecord[] = await database
      .select('*')
      .from('topics')
      .where('template_id', templateId)
      .andWhere('is_enabled', true)
      .orderBy('sort_order');

    const questionRecords: Array<QuestionRecord & QuestionTemplateRelRecord> = (
      await database.raw(`
      SELECT 
        templates_has_questions.*, questions.*
      FROM 
        templates_has_questions
      LEFT JOIN
        questions 
      ON 
        templates_has_questions.question_id = 
        questions.question_id
      ORDER BY
       templates_has_questions.sort_order`)
    ).rows;

    const fields = questionRecords.map(record =>
      createQuestionTemplateRelationObject(record)
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

  async createTopic(args: CreateTopicArgs): Promise<Topic> {
    await database('topics')
      .update({ sort_order: args.sortOrder + 1 })
      .where('sort_order', '>=', args.sortOrder);

    const newTopic = (
      await database('topics')
        .insert({
          topic_title: args.title || 'New Topic',
          sort_order: args.sortOrder,
          is_enabled: true,
          template_id: args.templateId,
        })
        .returning('*')
    )[0] as TopicRecord;

    return createTopicObject(newTopic);
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
      .from('topics')
      .where({ topic_id: topicId });

    if (!resultSet || resultSet.length != 1) {
      throw new Error('INSERT Topic resultSet must contain exactly 1 row');
    }

    return createTopicObject(resultSet[0]);
  }

  async updateQuestion(
    questionId: string,
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
      default_config: values.config,
    };

    await database
      .update(rows, ['*'])
      .from('questions')
      .where('question_id', questionId);

    const question = await this.getQuestion(questionId);
    if (!question) {
      throw new Error('Could not update field');
    }

    return question;
  }

  async createQuestionTemplateRelation(
    args: CreateQuestionTemplateRelationArgs
  ): Promise<Template> {
    const { templateId, questionId, sortOrder, topicId } = args;
    const question = await this.getQuestion(questionId);

    if (!question) {
      throw new Error(`Could not find question ${questionId}`);
    }

    await database('templates_has_questions').insert({
      question_id: questionId,
      template_id: templateId,
      topic_id: topicId,
      sort_order: sortOrder,
      config: question.config, // default_config
    });

    const returnValue = await this.getTemplate(templateId);
    if (!returnValue) {
      throw new Error('Could not get template');
    }

    return returnValue;
  }

  async updateQuestionTemplateRelation(
    args: UpdateQuestionTemplateRelationArgs
  ): Promise<Template> {
    const {
      templateId,
      questionId,
      dependency,
      sortOrder,
      topicId,
      config,
    } = args;
    await database('templates_has_questions')
      .update({
        topic_id: topicId,
        sort_order: sortOrder,
        config: config,
        dependency_question_id: dependency?.dependencyId || dependency,
        dependency_condition: dependency?.condition || dependency,
      })
      .where({ question_id: questionId, template_id: templateId });

    const returnValue = await this.getTemplate(templateId);
    if (!returnValue) {
      throw new Error('Could not get template');
    }

    return returnValue;
  }

  async updateTemplate(values: UpdateTemplateArgs): Promise<Template | null> {
    await database('templates')
      .update({
        name: values.name,
        description: values.description,
        is_archived: values.isArchived,
      })
      .where({ template_id: values.templateId });

    return this.getTemplate(values.templateId);
  }

  async createQuestion(
    category_id: TemplateCategoryId,
    question_id: string,
    natural_key: string,
    data_type: DataType,
    question: string,
    default_config: string
  ): Promise<Question> {
    const resultSet: QuestionRecord[] = await database
      .insert(
        {
          category_id,
          question_id,
          natural_key,
          data_type,
          question,
          default_config,
        },
        ['*']
      )
      .from('questions');

    if (!resultSet || resultSet.length != 1) {
      throw new Error('INSERT field resultSet must contain exactly 1 row');
    }

    return createQuestionObject(resultSet[0]);
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    return database('questions')
      .where({ question_id: questionId })
      .select('*')
      .then((resultSet: QuestionRecord[]) => {
        if (!resultSet || resultSet.length === 0) {
          return null;
        }

        return createQuestionObject(resultSet[0]);
      });
  }

  async getQuestionTemplateRelation(
    questionId: string,
    templateId: number
  ): Promise<QuestionTemplateRelation | null> {
    return database('templates_has_questions')
      .where({
        'templates_has_questions.question_id': questionId,
      })
      .andWhere({
        'templates_has_questions.template_id': templateId,
      })
      .leftJoin(
        'questions',
        'templates_has_questions.question_id',
        'questions.question_id'
      )
      .select('*')
      .then((resultSet: Array<QuestionTemplateRelRecord & QuestionRecord>) => {
        if (!resultSet || resultSet.length !== 1) {
          return null;
        }

        return createQuestionTemplateRelationObject(resultSet[0]);
      });
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    const [error, row] = await to(
      database('questions')
        .where({ question_id: questionId })
        .returning('*')
        .del()
    );
    if (error || row?.length !== 1) {
      logger.logError('Could not delete question', { fieldId: questionId });
      throw new Error(`Could not delete question ${questionId}`);
    }

    return createQuestionObject(row[0]);
  }

  async deleteQuestionTemplateRelation(
    args: DeleteQuestionTemplateRelationArgs
  ): Promise<Template> {
    const rowsAffected = await database('templates_has_questions')
      .where({
        template_id: args.templateId,
        question_id: args.questionId,
      })
      .del();

    if (rowsAffected !== 1) {
      throw new Error(
        `Could not delete questionId ${args.questionId} in templateId:${args.templateId}`
      );
    }
    const returnValue = await this.getTemplate(args.templateId);
    if (!returnValue) {
      throw new Error('Could not find template');
    }

    return returnValue;
  }

  async deleteTopic(topicId: number): Promise<Topic> {
    return database('topics')
      .where({ topic_id: topicId })
      .del(['*'])
      .then((result: TopicRecord[]) => {
        if (!result || result.length !== 1) {
          throw new Error(`Could not delete topic ${topicId}`);
        }

        return createTopicObject(result[0]);
      });
  }

  async updateTopicOrder(topicOrder: number[]): Promise<number[]> {
    topicOrder.forEach(async (topicId, index) => {
      return database('topics')
        .update({ sort_order: index })
        .where({ topic_id: topicId });
    });

    return topicOrder;
  }

  isNaturalKeyPresent(naturalKey: string): Promise<boolean> {
    return database('questions')
      .where({ natural_key: naturalKey })
      .select('natural_key')
      .then((result: []) => result.length > 0);
  }

  async cloneTemplate(templateId: number) {
    const sourceTemplate = await this.getTemplate(templateId);

    if (!sourceTemplate) {
      logger.logError(
        'Could not clone template because source template does not exist',
        { templateId }
      );

      throw new Error('Could not clone template');
    }
    const newTemplate = await this.createTemplate({
      categoryId: sourceTemplate.categoryId,
      name: `Copy of ${sourceTemplate.name}`,
      description: sourceTemplate.description,
    });

    // Clone topics
    await database.raw(`
      INSERT INTO topics(
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
          topics
      WHERE
          template_id=${sourceTemplate.templateId}
    `);

    // Clone templates_has_questions entries
    await database.raw(`
      INSERT INTO templates_has_questions 
                  (template_id, 
                  question_id, 
                  sort_order, 
                  dependency_question_id, 
                  dependency_condition,
                  config, 
                  topic_id) 
      SELECT ${newTemplate.templateId}, 
            question_id, 
            sort_order, 
            dependency_question_id, 
            dependency_condition,
            config, 
            (SELECT topic_id 
              FROM   topics AS newTopics 
              WHERE  template_id = ${newTemplate.templateId} 
                    AND sort_order = (SELECT sort_order 
                                      FROM   topics 
                                      WHERE  topic_id = source.topic_id)) 
      FROM   templates_has_questions AS source  
      WHERE template_id=${sourceTemplate.templateId}
    `);

    return newTemplate;
  }
}
