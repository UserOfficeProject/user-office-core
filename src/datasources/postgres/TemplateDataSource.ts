/* eslint-disable @typescript-eslint/camelcase */
import to from 'await-to-js';

import {
  DataType,
  ProposalTemplate,
  ProposalTemplateField,
  ProposalTemplateMetadata,
  TemplateStep,
  Topic,
} from '../../models/ProposalModel';
import { FieldDependencyInput } from '../../resolvers/mutations/UpdateProposalTemplateFieldMutation';
import { TemplateDataSource } from '../TemplateDataSource';
import database from './database';
import {
  createFieldDependencyObject,
  createProposalTemplateFieldObject,
  createProposalTemplateMetadataObject,
  createTopicObject,
  FieldDependencyRecord,
  ProposalQuestionRecord,
  ProposalTemplateMetadataRecord,
  TopicRecord,
} from './records';

export default class PostgresTemplateDataSource implements TemplateDataSource {
  async createTemplate(
    name: string,
    description?: string
  ): Promise<ProposalTemplateMetadata> {
    return database('proposal_templates')
      .insert({
        name,
        description,
      })
      .returning('*')
      .then((rows: ProposalTemplateMetadataRecord[]) => {
        if (rows.length !== 1) {
          throw new Error(
            `createTemplate expected 1 result got ${rows.length}. ${name} ${description}`
          );
        }

        return createProposalTemplateMetadataObject(rows[0]);
      });
  }

  async deleteTemplate(id: number): Promise<ProposalTemplateMetadata> {
    return database('proposal_templates')
      .delete()
      .where({ template_id: id })
      .returning('*')
      .then((resultSet: ProposalTemplateMetadataRecord[]) => {
        if (!resultSet || resultSet.length == 0) {
          throw new Error(`DeleteTemplate template does not exist. ID: ${id}`);
        }

        return createProposalTemplateMetadataObject(resultSet[0]);
      });
  }

  async getProposalTemplatesMetadata(
    isArchived?: boolean
  ): Promise<ProposalTemplateMetadata[]> {
    return database('proposal_templates')
      .select('*')
      .where({ is_archived: isArchived || false })
      .then((resultSet: ProposalTemplateMetadataRecord[]) => {
        if (!resultSet) {
          return [];
        }

        return resultSet.map(value =>
          createProposalTemplateMetadataObject(value)
        );
      });
  }
  async getProposalTemplate(): Promise<ProposalTemplate> {
    const dependenciesRecord: (FieldDependencyRecord & {
      natural_key: string;
    })[] = await database('proposal_question_dependencies')
      .join(
        'proposal_questions',
        'proposal_question_dependencies.proposal_question_dependency',
        'proposal_questions.proposal_question_id'
      )
      .select(
        'proposal_question_dependencies.*',
        'proposal_questions.natural_key'
      );

    const fieldRecords: ProposalQuestionRecord[] = await database
      .select('*')
      .from('proposal_questions')
      .orderBy('sort_order');

    const topicRecords: TopicRecord[] = await database
      .select('p.*')
      .from('proposal_topics as p')
      .where('p.is_enabled', true)
      .orderBy('sort_order');

    const topics = topicRecords.map(record => createTopicObject(record));
    const fields = fieldRecords.map(record =>
      createProposalTemplateFieldObject(record)
    );
    const dependencies = dependenciesRecord.map(record =>
      createFieldDependencyObject(record)
    );

    const steps = Array<TemplateStep>();
    topics.forEach(topic => {
      steps.push(
        new TemplateStep(
          topic,
          fields.filter(field => field.topic_id === topic.topic_id)
        )
      );
    });

    fields.forEach(field => {
      field.dependencies = dependencies.filter(
        dep => dep.question_id === field.proposal_question_id
      );
    });

    return new ProposalTemplate(steps);
  }

  async createTopic(sortOrder: number): Promise<ProposalTemplate> {
    await database('proposal_topics')
      .update({ sort_order: sortOrder + 1 })
      .where('sort_order', '>=', sortOrder);

    await database('proposal_topics').insert({
      topic_title: 'New Topic',
      sort_order: sortOrder,
      is_enabled: true,
    });

    return this.getProposalTemplate();
  }

  async updateTopic(
    id: number,
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
      .where({ topic_id: id });

    if (!resultSet || resultSet.length != 1) {
      throw new Error('INSERT Topic resultSet must contain exactly 1 row');
    }

    return createTopicObject(resultSet[0]);
  }

  async updateTemplateField(
    proposal_question_id: string,
    values: {
      naturalKey?: string;
      dataType?: string;
      question?: string;
      topicId?: number;
      config?: string;
      sortOrder?: number;
      dependencies?: FieldDependencyInput[];
    }
  ): Promise<ProposalTemplate> {
    const rows = {
      natural_key: values.naturalKey,
      data_type: values.dataType,
      question: values.question,
      topic_id: values.topicId,
      config: values.config,
      sort_order: values.sortOrder,
    };

    if (values.dependencies) {
      await database('proposal_question_dependencies')
        .where('proposal_question_id', proposal_question_id)
        .del();

      for (const dependency of values.dependencies) {
        await database('proposal_question_dependencies').insert({
          proposal_question_id: dependency.question_id,
          proposal_question_dependency: dependency.dependency_id,
          condition: dependency.condition,
        });
      }
    }

    return database
      .update(rows, ['*'])
      .from('proposal_questions')
      .where('proposal_question_id', proposal_question_id)
      .then(async () => await this.getProposalTemplate());
  }

  async createTemplateField(
    fieldId: string,
    naturalKey: string,
    topicId: number,
    dataType: DataType,
    question: string,
    config: string
  ): Promise<ProposalTemplateField> {
    const resultSet: ProposalQuestionRecord[] = await database
      .insert(
        {
          proposal_question_id: fieldId,
          natural_key: naturalKey,
          topic_id: topicId,
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

    return createProposalTemplateFieldObject(resultSet[0]);
  }

  async getTemplateField(
    fieldId: string
  ): Promise<ProposalTemplateField | null> {
    return database('proposal_questions')
      .where({ proposal_question_id: fieldId })
      .select('*')
      .then((resultSet: ProposalQuestionRecord[]) => {
        if (!resultSet || resultSet.length === 0) {
          return null;
        }

        return createProposalTemplateFieldObject(resultSet[0]);
      });
  }

  async deleteTemplateField(fieldId: string): Promise<ProposalTemplate> {
    const [, rowsAffected] = await to(
      database('proposal_questions')
        .where({ proposal_question_id: fieldId })
        .del()
    );
    if (rowsAffected !== 1) {
      throw new Error(`Could not delete template field ${fieldId}`);
    }

    return await this.getProposalTemplate();
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
}
