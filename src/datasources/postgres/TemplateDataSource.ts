import { logger } from '@user-office-software/duo-logger';

import { createConfig } from '../../models/questionTypes/QuestionRegistry';
import {
  DataType,
  FieldDependency,
  Question,
  QuestionComparison,
  ComparisonStatus,
  QuestionTemplateRelation,
  Template,
  TemplateCategory,
  TemplateExport,
  TemplateGroupId,
  TemplateValidation,
  TemplatesHasQuestions,
  TemplateStep,
  Topic,
  TemplateExportData,
  TemplateExportMetadata,
  TemplateValidationData,
} from '../../models/Template';
import { CreateTemplateArgs } from '../../resolvers/mutations/CreateTemplateMutation';
import { CreateTopicArgs } from '../../resolvers/mutations/CreateTopicMutation';
import { DeleteQuestionTemplateRelationArgs } from '../../resolvers/mutations/DeleteQuestionTemplateRelationMutation';
import { SetActiveTemplateArgs } from '../../resolvers/mutations/SetActiveTemplateMutation';
import { UpdateQuestionTemplateRelationSettingsArgs } from '../../resolvers/mutations/UpdateQuestionTemplateRelationSettingsMutation';
import { UpdateTemplateArgs } from '../../resolvers/mutations/UpdateTemplateMutation';
import { QuestionsFilter } from '../../resolvers/queries/QuestionsQuery';
import { TemplatesArgs } from '../../resolvers/queries/TemplatesQuery';
import { ConflictResolution } from '../../resolvers/types/ConflictResolution';
import {
  SampleDeclarationConfig,
  SubTemplateConfig,
} from '../../resolvers/types/FieldConfig';
import { deepEqual } from '../../utils/json';
import { isBelowVersion, isAboveVersion } from '../../utils/version';
import { TemplateDataSource } from '../TemplateDataSource';
import {
  TemplateCategoryId,
  ConflictResolutionStrategy,
} from './../../models/Template';
import database from './database';
import {
  createProposalTemplateObject,
  createQuestionObject,
  createQuestionTemplateRelationObject,
  createTemplateCategoryObject,
  createTemplateGroupObject,
  createTopicObject,
  QuestionDependencyRecord,
  QuestionRecord,
  QuestionTemplateRelRecord,
  TemplateCategoryRecord,
  TemplateGroupRecord,
  TemplateRecord,
  TopicRecord,
} from './records';

const EXPORT_VERSION = '1.2.0';
const MIN_SUPPORTED_VERSION = '1.2.0';

export default class PostgresTemplateDataSource implements TemplateDataSource {
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return database('template_categories')
      .select('*')
      .then((records: TemplateCategoryRecord[]) =>
        records.map((record) => createTemplateCategoryObject(record))
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
              FROM template_groups
              WHERE template_group_id = 
              ( SELECT group_id FROM templates
                WHERE template_id = ${templateId})
            )
        `
      )
    ).rows;

    if (!questionRecords) {
      return [];
    }

    return questionRecords.map((value) => createQuestionObject(value));
  }

  getQuestions(filter?: QuestionsFilter): Promise<Question[]> {
    return database
      .select('*')
      .from('questions')
      .modify((query) => {
        if (filter?.category !== undefined) {
          query.where('category_id', filter.category);
        }
        if (filter?.dataType !== undefined) {
          query.whereIn('data_type', filter.dataType);
        }
        if (filter?.excludeDataType !== undefined) {
          query.whereNotIn('data_type', filter.excludeDataType);
        }
        if (filter?.text !== undefined) {
          query.where('question', 'ilike', `%${filter.text}%`);
        }
      })
      .then((rows: QuestionRecord[]) => {
        return rows.map((row) => createQuestionObject(row));
      });
  }

  async createTemplate(args: CreateTemplateArgs): Promise<Template> {
    return database('templates')
      .insert({
        group_id: args.groupId,
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
      .modify((query) => {
        if (args.filter?.isArchived !== undefined) {
          query.where({ is_archived: args.filter?.isArchived });
        }
        if (args.filter?.group) {
          query.where({ group_id: args.filter?.group || undefined });
        }
        if (args.filter?.templateIds) {
          query.where('template_id', 'in', args.filter.templateIds);
        }
      })
      .then((resultSet: TemplateRecord[]) => {
        if (!resultSet) {
          return [];
        }

        return resultSet.map((value) => createProposalTemplateObject(value));
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

  async getSubtemplatesForQuestions(questions: Question[]) {
    const subTemplates: TemplateExportData[] = [];
    for await (const question of questions) {
      switch (question.dataType) {
        case DataType.GENERIC_TEMPLATE:
        case DataType.SAMPLE_DECLARATION:
          const config = question.config as
            | SubTemplateConfig
            | SampleDeclarationConfig;

          if (typeof config.templateId !== 'number') {
            throw new Error(
              `getTemplateAsJson expected number got ${typeof config.templateId}`
            );
          }

          const subTemplate = await this.getTemplateExportData(
            config.templateId
          );
          subTemplates.push(subTemplate);

          break;
      }
    }

    return subTemplates;
  }

  async getTemplateExportData(templateId: number): Promise<TemplateExportData> {
    const template = await this.getTemplate(templateId);
    const templateSteps = await this.getTemplateSteps(templateId);
    const questions = await this.getQuestionsInTemplate(templateId);
    const subTemplates = await this.getSubtemplatesForQuestions(questions);

    if (!template || !templateSteps || !questions || !subTemplates) {
      throw new Error(`Template does not exist. ID: ${templateId}`);
    }

    const data = new TemplateExportData(
      template,
      templateSteps,
      questions,
      subTemplates
    );

    return data;
  }
  async getTemplateExport(templateId: number): Promise<TemplateExport> {
    const EXPORT_DATE = new Date();

    const templateExportData = await this.getTemplateExportData(templateId);

    const templateExport: TemplateExport = new TemplateExport(
      new TemplateExportMetadata(EXPORT_VERSION, EXPORT_DATE),
      templateExportData
    );

    return templateExport;
  }

  isCriticalConflict = (questionA: Question, questionB: Question) =>
    questionA.dataType !== questionB.dataType ||
    questionA.categoryId !== questionB.categoryId;

  async validateTemplateExportData(
    data: TemplateExportData
  ): Promise<TemplateValidationData> {
    const errors: string[] = [];
    const questionComparisons: QuestionComparison[] = [];

    if (!data.template) {
      throw new Error('Template field is missing');
    }

    if (!data.templateSteps) {
      throw new Error('TemplateSteps field is missing');
    }

    if (!data.questions) {
      throw new Error('Questions field is missing');
    }

    if (!data.template.name) {
      throw new Error('Template.name field is missing');
    }

    if (!data.template.description) {
      throw new Error('Template.description field is missing');
    }

    if (!data.template.groupId) {
      throw new Error('Template.group field is missing');
    }

    const questionIds = data.questions.map((question) => question.id);

    const existingQuestions = await this.getQuestions({
      questionIds,
    });

    const newQuestions = data.questions.map(
      (question) =>
        new Question(
          question.categoryId,
          question.id,
          question.naturalKey,
          question.dataType,
          question.question,
          createConfig<any>(question.dataType as DataType, question.config)
        )
    );

    for (const newQuestion of newQuestions) {
      const existingQuestion =
        existingQuestions.find(
          (existingQuestion) => existingQuestion.id === newQuestion.id
        ) || null;

      if (!existingQuestion) {
        questionComparisons.push({
          existingQuestion: null,
          newQuestion: newQuestion,
          status: ComparisonStatus.NEW,
          conflictResolutionStrategy: ConflictResolutionStrategy.USE_NEW,
        });
      } else {
        if (deepEqual(newQuestion, existingQuestion)) {
          questionComparisons.push({
            existingQuestion: existingQuestion,
            newQuestion: newQuestion,
            status: ComparisonStatus.SAME,
            conflictResolutionStrategy: ConflictResolutionStrategy.USE_EXISTING,
          });
        } else {
          if (this.isCriticalConflict(newQuestion, existingQuestion)) {
            errors.push(
              `Question with ID ${newQuestion.id} has a critical conflict with an existing question.`
            );
          }
          questionComparisons.push({
            existingQuestion: existingQuestion,
            newQuestion: newQuestion,
            status: ComparisonStatus.DIFFERENT,
            conflictResolutionStrategy: ConflictResolutionStrategy.UNRESOLVED,
          });
        }
      }
    }

    const validatedSubTemplates = await Promise.all(
      data.subTemplates.map(async (template) => {
        return await this.validateTemplateExportData(template);
      })
    );

    return new TemplateValidationData(
      errors.length === 0,
      errors,
      questionComparisons,
      validatedSubTemplates
    );
  }

  async validateTemplateExport(templateExport: TemplateExport) {
    const { metadata, data } = templateExport;
    if (isBelowVersion(metadata.version, MIN_SUPPORTED_VERSION)) {
      throw new Error(
        `Template version ${metadata.version} is below the minimum supported version ${MIN_SUPPORTED_VERSION}.`
      );
    }

    if (isAboveVersion(metadata.version, EXPORT_VERSION)) {
      throw new Error(
        `Template version ${metadata.version} is above the current supported version ${EXPORT_VERSION}.`
      );
    }
    const dataValidation = await this.validateTemplateExportData(data);

    return new TemplateValidation(
      JSON.stringify(templateExport),
      metadata.version,
      metadata.exportDate,
      dataValidation
    );
  }

  async getQuestionsDependencies(
    questionRecords: Array<
      QuestionRecord &
        QuestionTemplateRelRecord & { dependency_natural_key: string }
    >,
    templateId: number
  ): Promise<FieldDependency[]> {
    const questionDependencies: QuestionDependencyRecord[] = await database
      .select('*')
      .from('question_dependencies')
      .where('template_id', templateId)
      .whereIn(
        'question_id',
        questionRecords.map((questionRecord) => questionRecord.question_id)
      );

    return questionDependencies.map((questionDependency) => {
      const question = questionRecords.find(
        (field) =>
          field.question_id === questionDependency.dependency_question_id
      );

      return new FieldDependency(
        questionDependency.question_id,
        questionDependency.dependency_question_id,
        question?.natural_key as string,
        questionDependency.dependency_condition
      );
    });
  }

  async getTemplateSteps(templateId: number): Promise<TemplateStep[]> {
    const topicRecords: TopicRecord[] = await database
      .select('*')
      .from('topics')
      .where('template_id', templateId)
      .andWhere('is_enabled', true)
      .orderBy('sort_order');

    const questionRecords: Array<
      QuestionRecord &
        QuestionTemplateRelRecord & { dependency_natural_key: string }
    > = (
      await database.raw(`
        SELECT 
          templates_has_questions.*, questions.*, questions.natural_key as dependency_natural_key
        FROM 
          templates_has_questions
        LEFT JOIN
          questions 
        ON 
          templates_has_questions.question_id = 
          questions.question_id
        WHERE
          templates_has_questions.template_id = ${templateId}
        ORDER BY
         templates_has_questions.sort_order`)
    ).rows;

    const dependencies = await this.getQuestionsDependencies(
      questionRecords,
      templateId
    );

    const fields = questionRecords.map((record) => {
      const questionDependencies = dependencies.filter(
        (dependency) => dependency.questionId === record.question_id
      );

      return createQuestionTemplateRelationObject(record, questionDependencies);
    });

    const steps = Array<TemplateStep>();
    topicRecords.forEach((topic) => {
      steps.push(
        new TemplateStep(
          createTopicObject(topic),
          fields.filter((field) => field.topicId === topic.topic_id)
        )
      );
    });

    return steps;
  }

  async getTopics(
    templateId: number,
    topicToExcludeId = 0
  ): Promise<Topic[] | null> {
    return database('topics')
      .where('template_id', templateId)
      .andWhere('topic_id', '!=', topicToExcludeId)
      .orderBy('sort_order')
      .select('*')
      .then((resultSet: TopicRecord[]) => {
        if (!resultSet) {
          return null;
        }

        return resultSet.map((resultItem) => createTopicObject(resultItem));
      });
  }

  async upsertTopics(data: Topic[]): Promise<Template> {
    const dataToUpsert = data.map((item) => ({
      topic_id: item.id,
      topic_title: item.title,
      template_id: item.templateId,
      ...(item.isEnabled !== undefined && { is_enabled: item.isEnabled }),
      ...(item.sortOrder !== undefined && { sort_order: item.sortOrder }),
    }));

    const result = await database.raw(
      `? ON CONFLICT (topic_id)
        DO UPDATE SET
        topic_title = EXCLUDED.topic_title,
        sort_order = EXCLUDED.sort_order
      RETURNING *;`,
      [database('topics').insert(dataToUpsert)]
    );

    if (result?.rows?.length) {
      const returnValue = await this.getTemplate(dataToUpsert[0].template_id);
      if (!returnValue) {
        throw new Error('Could not get template');
      }

      return returnValue;
    } else {
      throw new Error('Something went wrong');
    }
  }

  async createTopic(args: CreateTopicArgs): Promise<Topic> {
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

  async updateTopicTitle(topicId: number, title: string): Promise<Topic> {
    const resultSet: TopicRecord[] = await database
      .update(
        {
          topic_title: title,
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

  async updateQuestionTemplateRelationSettings(
    args: UpdateQuestionTemplateRelationSettingsArgs
  ): Promise<Template> {
    const {
      templateId,
      questionId,
      dependencies,
      config,
      dependenciesOperator,
    } = args;

    await database('templates_has_questions')
      .update({
        config: config,
        dependencies_operator: dependenciesOperator,
      })
      .where({ question_id: questionId, template_id: templateId });

    await database('question_dependencies')
      .where({ question_id: questionId })
      .andWhere({ template_id: templateId })
      .del();

    if (dependencies?.length) {
      const dataToInsert = dependencies.map((dependency) => ({
        question_id: questionId,
        template_id: templateId,
        dependency_question_id: dependency.dependencyId,
        dependency_condition: dependency.condition,
      }));

      await database('question_dependencies').insert(dataToInsert);
    }
    const returnValue = await this.getTemplate(templateId);
    if (!returnValue) {
      throw new Error('Could not get template');
    }

    return returnValue;
  }

  async upsertQuestionTemplateRelations(
    collection: TemplatesHasQuestions[]
  ): Promise<Template> {
    const dataToUpsert: QuestionTemplateRelRecord[] = [];

    for (const item of collection) {
      if (!item.config) {
        const question = await this.getQuestion(item.questionId);

        item.config = JSON.stringify(question?.config);
      }

      dataToUpsert.push({
        question_id: item.questionId,
        template_id: item.templateId,
        topic_id: item.topicId,
        sort_order: item.sortOrder,
        config: item.config,
      });
    }

    const result = await database.raw(
      `? ON CONFLICT (template_id, question_id)
          DO UPDATE SET
          sort_order = EXCLUDED.sort_order,
          topic_id = EXCLUDED.topic_id,
          config = EXCLUDED.config
        RETURNING *;`,
      [database('templates_has_questions').insert(dataToUpsert)]
    );

    if (result?.rows?.length) {
      const returnValue = await this.getTemplate(dataToUpsert[0].template_id);
      if (!returnValue) {
        throw new Error('Could not get template');
      }

      return returnValue;
    } else {
      throw new Error('Something went wrong');
    }
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

  async upsertQuestion(
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
      .from('questions')
      .onConflict('question_id')
      .merge();

    if (!resultSet || resultSet.length != 1) {
      throw new Error('Failure to upsert question');
    }

    return createQuestionObject(resultSet[0]);
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    return database('questions')
      .where({ question_id: questionId })
      .select('*')
      .first()
      .then((result: QuestionRecord | null) => {
        if (!result) {
          return null;
        }

        return createQuestionObject(result);
      });
  }

  async getQuestionByNaturalKey(naturalKey: string): Promise<Question | null> {
    return database('questions')
      .where({ natural_key: naturalKey })
      .select('*')
      .first()
      .then((result: QuestionRecord | null) => {
        if (!result) {
          return null;
        }

        return createQuestionObject(result);
      });
  }

  async getQuestionTemplateRelation(
    questionId: string,
    templateId: number
  ): Promise<QuestionTemplateRelation | null> {
    const [questionRecord]: Array<
      QuestionTemplateRelRecord &
        QuestionRecord & { dependency_natural_key: string }
    > = await database({
      templates_has_questions: 'templates_has_questions',
    })
      .where({
        'templates_has_questions.question_id': questionId,
      })
      .andWhere({
        'templates_has_questions.template_id': templateId,
      })
      .leftJoin(
        { questions: 'questions' },
        'templates_has_questions.question_id',
        'questions.question_id'
      )
      .select(
        'templates_has_questions.*',
        'questions.*',
        'questions.natural_key as dependency_natural_key'
      );

    if (!questionRecord) {
      return null;
    }

    const dependencies = await this.getQuestionsDependencies(
      [questionRecord],
      templateId
    );

    return createQuestionTemplateRelationObject(questionRecord, dependencies);
  }

  async getQuestionTemplateRelations(
    templateId: number,
    topicId: number,
    questionToExcludeId: string
  ): Promise<TemplatesHasQuestions[] | null> {
    return database('templates_has_questions')
      .where('template_id', templateId)
      .where('topic_id', topicId)
      .andWhere('question_id', '!=', questionToExcludeId)
      .orderBy('sort_order')
      .select('*')
      .then((resultSet: QuestionTemplateRelRecord[]) => {
        if (!resultSet) {
          return null;
        }

        return resultSet.map((resultItem) => ({
          questionId: resultItem.question_id,
          templateId: resultItem.template_id,
          topicId: resultItem.topic_id,
          sortOrder: resultItem.sort_order,
          dependencies: [],
          config: resultItem.config,
          dependenciesOperator: resultItem.dependencies_operator,
        }));
      });
  }

  async getActiveTemplateId(groupId: TemplateGroupId): Promise<number | null> {
    return database('active_templates')
      .select('template_id')
      .where('group_id', groupId)
      .first()
      .then((result: { template_id: number }) => {
        if (!result) {
          return null;
        }

        return result.template_id;
      });
  }

  async setActiveTemplate(args: SetActiveTemplateArgs): Promise<boolean> {
    await database('active_templates')
      .delete('template_id')
      .where('group_id', args.templateGroupId);

    await database('active_templates').insert({
      group_id: args.templateGroupId,
      template_id: args.templateId,
    });

    return true;
  }

  async deleteQuestion(questionId: string): Promise<Question> {
    const [questionRecord]: QuestionRecord[] = await database('questions')
      .where({ question_id: questionId })
      .returning('*')
      .del();
    if (!questionRecord) {
      logger.logError('Could not delete question', { fieldId: questionId });
      throw new Error(`Could not delete question ${questionId}`);
    }

    return createQuestionObject(questionRecord);
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
    const [topicRecord]: TopicRecord[] = await database('topics')
      .where({ topic_id: topicId })
      .del(['*']);

    if (!topicRecord) {
      throw new Error(`Could not delete topic ${topicId}`);
    }

    return createTopicObject(topicRecord);
  }

  async isNaturalKeyPresent(naturalKey: string): Promise<boolean> {
    return database('questions')
      .where({ natural_key: naturalKey })
      .select('natural_key')
      .then((result: QuestionRecord[]) => result.length > 0);
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
      groupId: sourceTemplate.groupId,
      name: `Copy of ${sourceTemplate.name}`,
      description: sourceTemplate.description,
    });

    // Clone topics
    await database.raw(`
      INSERT INTO topics
      (
        topic_title,
        is_enabled,
        sort_order,
        template_id
      )
      SELECT
        topic_title,
        is_enabled,
        sort_order,
        ${newTemplate.templateId}
      FROM 
        topics
      WHERE
        template_id = ${sourceTemplate.templateId}
    `);

    // Clone templates_has_questions entries
    await database.raw(`
      INSERT INTO templates_has_questions
      (
        template_id,
        question_id,
        sort_order,
        config,
        topic_id
      )
      SELECT
        ${newTemplate.templateId},
        question_id,
        sort_order,
        config,
        (
          SELECT topic_id
          FROM   topics AS newTopics
          WHERE  template_id = ${newTemplate.templateId}
          AND    sort_order =
          (
            SELECT sort_order
            FROM   topics
            WHERE  topic_id = source.topic_id
          )
        )
      FROM templates_has_questions AS source
      WHERE template_id = ${sourceTemplate.templateId}
    `);

    // Clone question_dependencies entries
    await database.raw(`
      INSERT INTO question_dependencies
      (
        template_id,
        question_id,
        dependency_question_id,
        dependency_condition
      )
      SELECT
        ${newTemplate.templateId},
        question_id,
	      dependency_question_id,
	      dependency_condition
      FROM  question_dependencies
      WHERE question_id IN
      (
		    SELECT question_id
		    FROM   templates_has_questions
      )
      AND template_id = ${sourceTemplate.templateId}
    `);

    return newTemplate;
  }

  async getGroup(groupId: TemplateGroupId) {
    return database('template_groups')
      .where({ template_group_id: groupId })
      .select('*')
      .first()
      .then((row: TemplateGroupRecord) => createTemplateGroupObject(row));
  }

  async getQuestionsInTemplate(templateId: number): Promise<Question[]> {
    const rows: QuestionRecord[] = await database('templates_has_questions')
      .where({ template_id: templateId })
      .leftJoin(
        'questions',
        'questions.question_id',
        'templates_has_questions.question_id'
      )
      .orderBy('sort_order')
      .select('*');

    return rows.map((row) => createQuestionObject(row));
  }

  async importQuestionTemplatRelation(
    templateId: number,
    topicId: number,
    field: QuestionTemplateRelation
  ) {
    await this.upsertQuestionTemplateRelations([
      {
        questionId: field.question.id,
        templateId: templateId,
        sortOrder: field.sortOrder,
        topicId: topicId,
        config: createConfig<any>(
          field.question.dataType as DataType,
          field.config
        ),
        dependencies: field.dependencies,
      },
    ]);

    if (field.dependencies.length > 0) {
      await this.updateQuestionTemplateRelationSettings({
        questionId: field.question.id,
        templateId: templateId,
        config: createConfig<any>(
          field.question.dataType as DataType,
          field.config
        ),
        dependenciesOperator: field.dependenciesOperator,
        dependencies: field.dependencies,
      });
    }
  }

  async importTemplateStep(templateId: number, step: TemplateStep) {
    const newTopic = await this.createTopic({
      title: step.topic.title,
      templateId: templateId,
      sortOrder: step.topic.sortOrder,
    });

    // we need to import questions that depend on other questions last
    const orderedStepsByDependency = step.fields.sort(
      (a, b) => a.dependencies.length - b.dependencies.length
    );
    for await (const field of orderedStepsByDependency) {
      await this.importQuestionTemplatRelation(templateId, newTopic.id, field);
    }

    return newTopic;
  }

  async importTemplate(
    templateExport: TemplateExport,
    conflictResolutions: ConflictResolution[],
    subTemplatesConflictResolutions?: ConflictResolution[][]
  ) {
    return this.importTemplateData(
      templateExport.data,
      conflictResolutions,
      subTemplatesConflictResolutions
    );
  }

  async importTemplateData(
    templateExport: TemplateExportData,
    conflictResolutions: ConflictResolution[],
    subTemplatesConflictResolutions?: ConflictResolution[][]
  ): Promise<Template> {
    const { template, questions, templateSteps, subTemplates } = templateExport;

    const importedSubTemplatesMap: { oldId: number; newId: number }[] = [];

    // Get mapping of old subtemplate ids to new subtemplate ids
    for (let i = 0; i < subTemplates.length; i++) {
      importedSubTemplatesMap.push({
        oldId: subTemplates[i].template.templateId,
        newId: (
          await this.importTemplateData(
            subTemplates[i],
            (subTemplatesConflictResolutions as ConflictResolution[][])[i]
          )
        ).templateId,
      });
    }

    importedSubTemplatesMap.forEach((subTemplate) => {
      // Update the subtemplate id in the questions
      questions.map((question) => {
        if (
          (question.dataType == DataType.GENERIC_TEMPLATE ||
            question.dataType == DataType.SAMPLE_DECLARATION) &&
          (question.config as SubTemplateConfig | SubTemplateConfig)
            .templateId == subTemplate.oldId
        ) {
          (
            question.config as SubTemplateConfig | SubTemplateConfig
          ).templateId = subTemplate.newId;
        }
      });
      // Update the subtemplates ids in the template steps
      templateSteps.map((step) => {
        step.fields.map((field) => {
          if (
            (field.question.dataType == DataType.GENERIC_TEMPLATE ||
              field.question.dataType == DataType.SAMPLE_DECLARATION) &&
            (field.question.config as SubTemplateConfig | SubTemplateConfig)
              .templateId == subTemplate.oldId
          ) {
            (field.config as SubTemplateConfig | SubTemplateConfig).templateId =
              subTemplate.newId;
            (
              field.question.config as SubTemplateConfig | SubTemplateConfig
            ).templateId = subTemplate.newId;
          }
        });
      });
    });

    await Promise.all(
      questions.map(async (question) => {
        const conflictResolution = conflictResolutions.find(
          (resolution) => resolution.itemId === question.id
        );
        switch (conflictResolution?.strategy) {
          case ConflictResolutionStrategy.USE_NEW:
            await this.upsertQuestion(
              question.categoryId,
              question.id,
              question.naturalKey,
              question.dataType,
              question.question,
              createConfig<any>(question.dataType as DataType, question.config)
            );
            break;

          case ConflictResolutionStrategy.USE_EXISTING:
            break;
          case ConflictResolutionStrategy.UNRESOLVED:
            throw new Error('No conflict resolution strategy provided');
          default:
            throw new Error('Unknown conflict resolution strategy');
        }
      })
    );

    const newTemplate = await this.createTemplate({
      groupId: template.groupId,
      name: template.name,
      description: template.description,
    });

    for (const step of templateSteps) {
      await this.importTemplateStep(newTemplate.templateId, step);
    }

    return newTemplate;
  }
}
