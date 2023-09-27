import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { PdfTemplateRecord } from 'knex/types/tables';

import { PdfTemplate } from '../../models/PdfTemplate';
import { UpdatePdfTemplateArgs } from '../../resolvers/mutations/UpdatePdfTemplateMutation';
import { PdfTemplatesArgs } from '../../resolvers/queries/PdfTemplatesQuery';
import {
  CreatePdfTemplateInputWithCreator,
  PdfTemplateDataSource,
} from '../PdfTemplateDataSource';
import database from './database';
import { createPdfTemplateObject } from './records';

export default class PostgresPdfTemplateDataSource
  implements PdfTemplateDataSource
{
  async createPdfTemplate({
    templateId,
    templateData,
    templateHeader,
    templateFooter,
    templateSampleDeclaration,
    creatorId,
  }: CreatePdfTemplateInputWithCreator): Promise<PdfTemplate> {
    const templates: PdfTemplateRecord[] = await database(
      'pdf_templates'
    ).insert(
      {
        template_id: templateId,
        template_data: templateData,
        template_header: templateHeader,
        template_footer: templateFooter,
        template_sample_declaration: templateSampleDeclaration,
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

    return createPdfTemplateObject(templates[0]);
  }

  async getPdfTemplate(pdfTemplateId: number): Promise<PdfTemplate | null> {
    const template: PdfTemplateRecord | undefined = await database(
      'pdf_templates'
    )
      .select('*')
      .where('pdf_template_id', pdfTemplateId)
      .first();

    if (!template) {
      logger.logInfo('Could not get PDF template as it does not exist', {
        pdfTemplateId,
      });
    }

    return template ? createPdfTemplateObject(template) : null;
  }

  async delete(pdfTemplateId: number): Promise<PdfTemplate> {
    const templates: PdfTemplateRecord[] = await database('pdf_templates')
      .where({ pdf_template_id: pdfTemplateId })
      .delete('*');

    if (templates.length !== 1) {
      logger.logError('Could not delete PDF template', {
        pdfTemplateId,
      });

      throw new GraphQLError('Could not delete PDF template');
    }

    return createPdfTemplateObject(templates[0]);
  }

  async updatePdfTemplate(args: UpdatePdfTemplateArgs): Promise<PdfTemplate> {
    const templates: PdfTemplateRecord[] = await database('pdf_templates')
      .update(
        {
          template_data: args.templateData,
          template_header: args.templateHeader,
          template_footer: args.templateFooter,
          template_sample_declaration: args.templateSampleDeclaration,
        },
        '*'
      )
      .where({ pdf_template_id: args.pdfTemplateId });

    if (templates.length !== 1) {
      logger.logError('Could not update PDF template', { args });

      throw new GraphQLError('Could not update PDF template');
    }

    return createPdfTemplateObject(templates[0]);
  }

  async clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<PdfTemplate> {
    const sourceTemplate: PdfTemplateRecord | undefined = await database(
      'pdf_templates'
    )
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
      creatorId: sourceTemplate.creator_id,
    });

    return newTemplate;
  }

  async getPdfTemplates(args: PdfTemplatesArgs): Promise<PdfTemplate[]> {
    const filter = args.filter;

    const templates: PdfTemplateRecord[] = await database('pdf_templates')
      .modify((query) => {
        if (filter?.pdfTemplateIds) {
          query.where('pdf_template_id', 'in', filter.pdfTemplateIds);
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

    return templates.map((template) => createPdfTemplateObject(template));
  }
}
