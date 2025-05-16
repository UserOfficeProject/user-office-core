import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { ExperimentSafetyPdfTemplateRecord } from 'knex/types/tables';

import { ExperimentSafetyPdfTemplate } from '../../models/ExperimentSafetyPdfTemplate';
import { UpdateExperimentSafetyPdfTemplateArgs } from '../../resolvers/mutations/UpdateExperimentSafetyPdfTemplateMutation';
import { ExperimentSafetyPdfTemplatesArgs } from '../../resolvers/queries/ExperimentSafetyPdfTemplatesQuery';
import {
  CreateExperimentSafetyPdfTemplateInputWithCreator,
  ExperimentSafetyPdfTemplateDataSource,
} from '../ExperimentSafetyPdfTemplateDataSource';
import database from './database';
import { createExperimentSafetyPdfTemplateObject } from './records';

export default class PostgresExperimentSafetyPdfTemplateDataSource
  implements ExperimentSafetyPdfTemplateDataSource
{
  async createPdfTemplate({
    templateId,
    templateData,
    templateHeader,
    templateFooter,
    templateSampleDeclaration,
    dummyData,
    creatorId,
  }: CreateExperimentSafetyPdfTemplateInputWithCreator): Promise<ExperimentSafetyPdfTemplate> {
    const templates: ExperimentSafetyPdfTemplateRecord[] = await database(
      'experiment_safety_pdf_templates'
    ).insert(
      {
        template_id: templateId,
        template_data: templateData,
        template_header: templateHeader,
        template_footer: templateFooter,
        template_sample_declaration: templateSampleDeclaration,
        dummy_data: dummyData,
        creator_id: creatorId,
      },
      '*'
    );

    if (templates.length !== 1) {
      logger.logError('Could not create PDF template', {
        templateId,
        templateData,
        creatorId,
      });

      throw new GraphQLError('Failed to insert PDF template');
    }

    return createExperimentSafetyPdfTemplateObject(templates[0]);
  }

  async getPdfTemplate(
    experimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate | null> {
    const template: ExperimentSafetyPdfTemplateRecord | undefined =
      await database('experiment_safety_pdf_templates')
        .select('*')
        .where(
          'experiment_safety_pdf_template_id',
          experimentSafetyPdfTemplateId
        )
        .first();

    if (!template) {
      logger.logInfo('Could not get PDF template as it does not exist', {
        experimentSafetyPdfTemplateId,
      });
    }

    return template ? createExperimentSafetyPdfTemplateObject(template) : null;
  }

  async delete(
    experimentSafetyPdfTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate> {
    const templates: ExperimentSafetyPdfTemplateRecord[] = await database(
      'experiment_safety_pdf_templates'
    )
      .where({
        experiment_safety_pdf_template_id: experimentSafetyPdfTemplateId,
      })
      .delete('*');

    if (templates.length !== 1) {
      logger.logError('Could not delete PDF template', {
        experimentSafetyPdfTemplateId,
      });

      throw new GraphQLError('Could not delete PDF template');
    }

    return createExperimentSafetyPdfTemplateObject(templates[0]);
  }

  async updatePdfTemplate(
    args: UpdateExperimentSafetyPdfTemplateArgs
  ): Promise<ExperimentSafetyPdfTemplate> {
    const templates: ExperimentSafetyPdfTemplateRecord[] = await database(
      'experiment_safety_pdf_templates'
    )
      .update(
        {
          template_data: args.templateData,
          template_header: args.templateHeader,
          template_footer: args.templateFooter,
          template_sample_declaration: args.templateSampleDeclaration,
          dummy_data: args.dummyData,
        },
        '*'
      )
      .where({
        experiment_safety_pdf_template_id: args.experimentSafetyPdfTemplateId,
      });

    if (templates.length !== 1) {
      logger.logError('Could not update PDF template', { args });

      throw new GraphQLError('Could not update PDF template');
    }

    return createExperimentSafetyPdfTemplateObject(templates[0]);
  }

  async clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<ExperimentSafetyPdfTemplate> {
    const sourceTemplate: ExperimentSafetyPdfTemplateRecord | undefined =
      await database('experiment_safety_pdf_templates')
        .where({
          template_id: sourceTemplateId,
        })
        .first(); // Unique constraint prevents duplicates

    if (!sourceTemplate) {
      logger.logError(
        'Could not clone PDF template because source PDF template does not exist',
        { template_id: sourceTemplateId }
      );
      throw new GraphQLError('Could not clone PDF template');
    }

    const newTemplate = await this.createPdfTemplate({
      templateId: newTemplateId,
      templateData: sourceTemplate.template_data,
      templateHeader: sourceTemplate.template_header,
      templateFooter: sourceTemplate.template_footer,
      templateSampleDeclaration: sourceTemplate.template_sample_declaration,
      dummyData: sourceTemplate.dummy_data,
      creatorId: sourceTemplate.creator_id,
    });

    return newTemplate;
  }

  async getPdfTemplates(
    args: ExperimentSafetyPdfTemplatesArgs
  ): Promise<ExperimentSafetyPdfTemplate[]> {
    const filter = args.filter;

    const templates: ExperimentSafetyPdfTemplateRecord[] = await database(
      'experiment_safety_pdf_templates'
    )
      .modify((query) => {
        if (filter?.experimentSafetyPdfTemplateIds) {
          query.where(
            'experiment_safety_pdf_template_id',
            'in',
            filter.experimentSafetyPdfTemplateIds
          );
        }
        if (filter?.templateIds) {
          query.where('template_id', 'in', filter.templateIds);
        }
        if (filter?.pdfTemplateData) {
          query.where('template_data', 'like', `%${filter.pdfTemplateData}%`);
        }
        if (filter?.pdfTemplateHeader) {
          query.where(
            'template_header',
            'like',
            `%${filter.pdfTemplateHeader}%`
          );
        }
        if (filter?.pdfTemplateFooter) {
          query.where(
            'template_footer',
            'like',
            `%${filter.pdfTemplateFooter}%`
          );
        }
        if (filter?.pdfTemplateSampleDeclaration) {
          query.where(
            'template_sample_declaration',
            'like',
            `%${filter.pdfTemplateFooter}%`
          );
        }
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
      })
      .select('*')
      .orderBy('created_at', 'asc');

    return templates.map((template) =>
      createExperimentSafetyPdfTemplateObject(template)
    );
  }
}
