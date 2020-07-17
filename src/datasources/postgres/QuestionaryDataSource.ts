/* eslint-disable @typescript-eslint/camelcase */
import { Questionary, QuestionaryStep } from '../../models/ProposalModel';
import { QuestionaryDataSource } from '../QuestionaryDataSource';
import { Answer } from './../../models/ProposalModel';
import database from './database';
import {
  createQuestionaryObject,
  createQuestionTemplateRelationObject,
  createTopicObject,
  QuestionaryRecord,
  QuestionRecord,
  QuestionTemplateRelRecord,
  TopicRecord,
} from './records';

export default class PostgresQuestionaryDataSource
  implements QuestionaryDataSource {
  getParentQuestionary(
    child_questionary_id: number
  ): Promise<Questionary | null> {
    const subquery = database('answer_has_questionaries')
      .select('answer_id')
      .where({ questionary_id: child_questionary_id });

    return database('questionaries')
      .select('*')
      .whereIn('questionary_id', subquery)
      .then((rows: QuestionaryRecord[]) => {
        if (rows.length !== 1) {
          return null;
        }

        return createQuestionaryObject(rows[0]);
      });
  }
  create(creator_id: number, template_id: number): Promise<Questionary> {
    return database('questionaries')
      .insert({ template_id, creator_id }, '*')
      .then((rows: QuestionaryRecord[]) => {
        return createQuestionaryObject(rows[0]);
      });
  }
  async delete(questionary_id: number): Promise<Questionary> {
    const questionarySet: QuestionaryRecord[] = await database('questionaries')
      .where({ questionary_id })
      .returning(['*'])
      .delete();

    return createQuestionaryObject(questionarySet[0]);
  }
  async updateAnswer(
    questionary_id: number,
    question_id: string,
    answer: string
  ): Promise<string> {
    const results: { count: string } = await database
      .count()
      .from('answers')
      .where({
        questionary_id,
        question_id,
      })
      .first();

    const hasEntry = results && results.count !== '0';
    if (hasEntry) {
      return database('answers')
        .update({
          answer: answer,
        })
        .where({
          questionary_id,
          question_id,
        })
        .then(() => question_id);
    } else {
      return database('answers')
        .insert({
          questionary_id,
          question_id,
          answer,
        })
        .then(() => question_id);
    }
  }

  async insertFiles(
    proposal_id: number,
    question_id: string,
    files: string[]
  ): Promise<string[]> {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if (!answerId) {
      throw new Error(
        `Could not insert files because answer does not exist. AnswerID ${answerId}`
      );
    }

    await database('answer_has_files').insert(
      files.map(file => ({ answer_id: answerId, file_id: file }))
    );

    return files;
  }

  async deleteFiles(
    proposal_id: number,
    question_id: string
  ): Promise<string[]> {
    const answerId = await this.getAnswerId(proposal_id, question_id);
    if (!answerId) {
      throw new Error(
        `Could not delete files because answer does not exist. AnswerID ${answerId}`
      );
    }

    return await database('answer_has_files')
      .where({ answer_id: answerId })
      .returning('file_id')
      .del();
  }

  private async getAnswerId(
    proposal_id: number,
    question_id: string
  ): Promise<number | null> {
    const selectResult = await database
      .from('answers')
      .where({
        proposal_id,
        question_id,
      })
      .select('answer_id');

    if (!selectResult || selectResult.length != 1) {
      return null;
    }

    return selectResult[0].answer_id;
  }

  async getBlankQuestionarySteps(
    template_id: number
  ): Promise<QuestionaryStep[]> {
    return this.getQuestionaryStepsWithTemplateId(0, template_id);
  }

  async getQuestionary(questionary_id: number): Promise<Questionary | null> {
    return database('questionaries')
      .select('*')
      .where({ questionary_id })
      .then((rows: QuestionaryRecord[]) => {
        if (rows && rows.length === 1) {
          return createQuestionaryObject(rows[0]);
        } else {
          return null;
        }
      });
  }
  async getQuestionarySteps(
    questionary_id: number
  ): Promise<QuestionaryStep[]> {
    const questionary = await this.getQuestionary(questionary_id);
    if (!questionary) {
      return [];
    }

    return this.getQuestionaryStepsWithTemplateId(
      questionary_id,
      questionary.templateId
    );
  }

  async updateTopicCompleteness(
    questionary_id: number,
    topic_id: number,
    is_complete: boolean
  ): Promise<void> {
    return database.transaction(async trx => {
      await database
        .raw(
          `INSERT into topic_completenesses(questionary_id, topic_id, is_complete) VALUES(?,?,?) ON CONFLICT (questionary_id, topic_id)  DO UPDATE set is_complete=${is_complete}`,
          [questionary_id, topic_id, is_complete]
        )
        .transacting(trx);
    });
  }

  private async getQuestionaryStepsWithTemplateId(
    questionary_id: number,
    template_id: number
  ): Promise<QuestionaryStep[]> {
    const topicRecords: (TopicRecord & {
      is_complete: boolean;
    })[] = (
      await database.raw(`
              SELECT 
                topics.*, topic_completenesses.is_complete
              FROM 
                topics
              LEFT JOIN
              topic_completenesses
              ON 
                topics.topic_id = topic_completenesses.topic_id
                AND topic_completenesses.questionary_id = ${questionary_id}
              WHERE
                topics.template_id = ${template_id}
              ORDER BY
                topics.sort_order`)
    ).rows;

    const answerRecords: Array<QuestionRecord &
      QuestionTemplateRelRecord & { value: any }> = (
      await database.raw(`
                SELECT 
                  templates_has_questions.*, questions.*, answers.answer as value
                FROM 
                  templates_has_questions
                LEFT JOIN
                  questions 
                ON 
                  templates_has_questions.question_id = 
                  questions.question_id
                LEFT JOIN
                  answers
                ON
                  templates_has_questions.question_id = 
                  answers.question_id
                AND
                  answers.questionary_id=${questionary_id}
                ORDER BY
                 templates_has_questions.sort_order`)
    ).rows;

    const fields = answerRecords.map(record => {
      const value = record.value ? JSON.parse(record.value).value : '';

      return new Answer(createQuestionTemplateRelationObject(record), value);
    });

    const steps = Array<QuestionaryStep>();
    topicRecords.forEach(topic => {
      steps.push(
        new QuestionaryStep(
          createTopicObject(topic),
          topic.is_complete || false,
          fields.filter(field => field.topicId === topic.topic_id)
        )
      );
    });

    return steps;
  }
}
