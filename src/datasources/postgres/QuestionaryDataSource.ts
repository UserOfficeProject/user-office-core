import { logger } from '@user-office-software/duo-logger';

import {
  Answer,
  AnswerBasic,
  Questionary,
  QuestionaryStep,
} from '../../models/Questionary';
import { getDefaultAnswerValue } from '../../models/questionTypes/QuestionRegistry';
import { FieldDependency, Template, Topic } from '../../models/Template';
import { QuestionaryDataSource } from '../QuestionaryDataSource';
import database from './database';
import {
  createAnswerBasic,
  createProposalTemplateObject,
  createQuestionaryObject,
  createQuestionTemplateRelationObject,
  createTopicObject,
  QuestionaryRecord,
  QuestionDependencyRecord,
  QuestionRecord,
  QuestionTemplateRelRecord,
  TopicRecord,
} from './records';

export default class PostgresQuestionaryDataSource
  implements QuestionaryDataSource
{
  async getIsCompleted(questionaryId: number): Promise<boolean> {
    const unFinishedTopics: Topic[] = (
      await database.raw(
        `
        SELECT *
        FROM topics
        LEFT JOIN (
            SELECT *
            FROM topic_completenesses
            WHERE questionary_id = ?
          ) topic_completenesses ON topic_completenesses.topic_id = topics.topic_id
        WHERE topics.template_id =(
              select template_id
              from questionaries
              where questionary_id = ?
          )
          AND topic_completenesses.is_complete IS NOT true`,
        [questionaryId, questionaryId]
      )
    ).rows;

    return unFinishedTopics.length === 0;
  }

  async deleteAnswers(
    questionary_id: number,
    question_ids: string[]
  ): Promise<void> {
    return database('answers')
      .whereIn('question_id', question_ids)
      .andWhere('questionary_id', questionary_id)
      .delete();
  }
  async getCount(templateId: number): Promise<number> {
    return database('questionaries')
      .count('questionary_id')
      .where('template_id', templateId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }
  async getAnswer(
    questionaryId: number,
    naturalKey: string
  ): Promise<AnswerBasic>;
  async getAnswer(answerId: number): Promise<AnswerBasic>;
  async getAnswer(answerIdOrQuestionaryId: number, naturalKey?: string) {
    if (naturalKey) {
      const questionaryId = answerIdOrQuestionaryId;

      return database
        .select('*')
        .from('answers')
        .leftJoin('questions', 'answers.question_id', 'questions.question_id')
        .where({
          questionary_id: questionaryId,
          natural_key: naturalKey,
        })
        .first()
        .then((record) => {
          return record ? createAnswerBasic(record) : null;
        });
    } else {
      const answerId = answerIdOrQuestionaryId;

      return database('answers')
        .select('*')
        .where('answer_id', answerId)
        .first()
        .then((record) => createAnswerBasic(record));
    }
  }

  async getAnswers(questionId: string): Promise<AnswerBasic[]> {
    return database('answers')
      .where('question_id', questionId)
      .then((rows) => {
        return rows.map((row) => createAnswerBasic(row));
      });
  }
  async getTemplates(questionId: string): Promise<Template[]> {
    return database('templates_has_questions')
      .leftJoin(
        'templates',
        'templates.template_id',
        '=',
        'templates_has_questions.template_id'
      )
      .where('question_id', questionId)
      .then((rows) => {
        return rows.map((row) => createProposalTemplateObject(row));
      });
  }

  async create(creator_id: number, template_id: number): Promise<Questionary> {
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
    const results: { count?: string | number | undefined } | undefined =
      await database
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
    proposal_pk: number,
    question_id: string,
    files: string[]
  ): Promise<string[]> {
    const answerId = await this.getAnswerId(proposal_pk, question_id);
    if (!answerId) {
      throw new Error(
        `Could not insert files because answer does not exist. AnswerID ${answerId}`
      );
    }

    await database('answer_has_files').insert(
      files.map((file) => ({ answer_id: answerId, file_id: file }))
    );

    return files;
  }

  async deleteFiles(
    proposal_pk: number,
    question_id: string
  ): Promise<string[]> {
    const answerId = await this.getAnswerId(proposal_pk, question_id);
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
    proposal_pk: number,
    question_id: string
  ): Promise<number | null> {
    const selectResult = await database
      .from('answers')
      .where({
        proposal_pk,
        question_id,
      })
      .select('answer_id');

    if (!selectResult || selectResult.length != 1) {
      return null;
    }

    return selectResult[0].answer_id;
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

  async getBlankQuestionarySteps(
    templateId: number
  ): Promise<QuestionaryStep[]> {
    return this.getQuestionaryStepsWithTemplateId(0, templateId);
  }

  async updateTopicCompleteness(
    questionary_id: number,
    topic_id: number,
    is_complete: boolean
  ): Promise<void> {
    return database.transaction(async (trx) => {
      await database
        .raw(
          `INSERT into topic_completenesses(questionary_id, topic_id, is_complete) VALUES(?,?,?) ON CONFLICT (questionary_id, topic_id)  DO UPDATE set is_complete=${is_complete}`,
          [questionary_id, topic_id, is_complete]
        )
        .transacting(trx);
    });
  }

  // TODO: This is repeated in template datasource. Find a way to reuse it.
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

  private async getQuestionaryStepsWithTemplateId(
    questionaryId: number,
    templateId: number
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
                AND topic_completenesses.questionary_id = ${questionaryId}
              WHERE
                topics.template_id = ${templateId}
              ORDER BY
                topics.sort_order`)
    ).rows;

    // this contains all questions for template, with left joined answers
    // meaning that if there is no answer, it will still be on the list but `null`
    const answerRecords: Array<
      QuestionRecord &
        QuestionTemplateRelRecord & { value: any; answer_id: number } & {
          dependency_natural_key: string;
        }
    > = (
      await database.raw(`
        SELECT 
          templates_has_questions.*, questions.*, answers.answer as value, answers.answer_id, questions.natural_key as dependency_natural_key
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
          answers.questionary_id=${questionaryId}
        ORDER BY
          templates_has_questions.sort_order`)
    ).rows;

    const dependencies = await this.getQuestionsDependencies(
      answerRecords,
      templateId
    );

    const fields = answerRecords.map((record) => {
      const questionDependencies = dependencies.filter(
        (dependency) => dependency.questionId === record.question_id
      );

      const questionTemplateRelation = createQuestionTemplateRelationObject(
        record,
        questionDependencies
      );

      // if no answer has been saved, return the default answer value
      const value =
        record.value === null
          ? getDefaultAnswerValue(questionTemplateRelation)
          : record.value.value;

      return new Answer(record.answer_id, questionTemplateRelation, value);
    });

    const steps = Array<QuestionaryStep>();
    topicRecords.forEach((topic) => {
      steps.push(
        new QuestionaryStep(
          questionaryId,
          createTopicObject(topic),
          topic.is_complete || false,
          fields.filter((field) => field.topicId === topic.topic_id)
        )
      );
    });

    return steps;
  }

  async copyAnswers(
    sourceQuestionaryId: number,
    targetQuestionaryId: number
  ): Promise<void> {
    const sourceQuestionary = await this.getQuestionary(sourceQuestionaryId);
    const targetQuestionary = await this.getQuestionary(targetQuestionaryId);

    const sourceTemplateId = sourceQuestionary?.templateId;
    const targetTemplateId = targetQuestionary?.templateId;

    if (!sourceTemplateId || !targetTemplateId) {
      throw new Error(
        'Can not copy questions, because no template for the questionary was found'
      );
    }
    await database.raw(
      `
      INSERT INTO 
      answers(questionary_id, question_id, answer)
      SELECT :targetQuestionaryId, question_id, answer FROM answers 
      WHERE question_id IN (
        SELECT question_id 
        FROM templates_has_questions
        WHERE question_id IN
          (
            SELECT question_id from templates_has_questions
            WHERE template_id=:targetTemplateId
          )
        AND template_id=:sourceTemplateId
      )
      AND questionary_id = :sourceQuestionaryId
  `,
      {
        targetQuestionaryId,
        targetTemplateId,
        sourceTemplateId,
        sourceQuestionaryId,
      }
    );
  }

  async clone(questionaryId: number): Promise<Questionary> {
    const sourceQuestionary = await this.getQuestionary(questionaryId);
    if (!sourceQuestionary) {
      logger.logError(
        'Could not clone questionary because source questionary does not exist',
        { questionaryId }
      );

      throw new Error('Could not clone questionary');
    }
    const clonedQuestionary = await this.create(
      sourceQuestionary.creatorId,
      sourceQuestionary.templateId
    );

    // Clone answers
    await database.raw(
      `
      INSERT INTO answers(
          questionary_id
        , question_id
        , answer
      )
      SELECT 
          :clonedQuestionaryId
        , question_id
        , answer
      FROM 
        answers
      WHERE
        questionary_id = :sourceQuestionaryId
    `,
      {
        clonedQuestionaryId: clonedQuestionary.questionaryId,
        sourceQuestionaryId: sourceQuestionary.questionaryId,
      }
    );

    await database.raw(
      `
      INSERT INTO topic_completenesses(
          questionary_id
        , topic_id
        , is_complete
      )
      SELECT 
          :clonedQuestionaryId
        , topic_id
        , is_complete
      FROM
        topic_completenesses
      WHERE
        questionary_id = :sourceQuestionaryId
    `,
      {
        clonedQuestionaryId: clonedQuestionary.questionaryId,
        sourceQuestionaryId: sourceQuestionary.questionaryId,
      }
    );

    return clonedQuestionary;
  }
}
