import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import { ProposalPdfTemplate } from '../../models/ProposalPdfTemplate';
import { UpdateProposalPdfTemplateArgs } from '../../resolvers/mutations/UpdateProposalPdfTemplateMutation';
import { ProposalPdfTemplatesArgs } from '../../resolvers/queries/ProposalPdfTemplatesQuery';
import {
  CreateProposalPdfTemplateInputWithCreator,
  ProposalPdfTemplateDataSource,
} from '../ProposalPdfTemplateDataSource';
import database from './database';
import {
  createProposalPdfTemplateObject,
  ProposalPdfTemplateRecord,
} from './records';

export default class PostgresProposalPdfTemplateDataSource
  implements ProposalPdfTemplateDataSource
{
  async createPdfTemplate({
    templateId,
    templateData,
    templateHeader,
    templateFooter,
    templateSampleDeclaration,
    dummyData,
    creatorId,
  }: CreateProposalPdfTemplateInputWithCreator): Promise<ProposalPdfTemplate> {
    const templates: ProposalPdfTemplateRecord[] = await database(
      'proposal_pdf_templates'
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

    return createProposalPdfTemplateObject(templates[0]);
  }

  async getPdfTemplate(
    proposalPdfTemplateId: number
  ): Promise<ProposalPdfTemplate | null> {
    const template: ProposalPdfTemplateRecord | undefined = await database(
      'proposal_pdf_templates'
    )
      .select('*')
      .where('proposal_pdf_template_id', proposalPdfTemplateId)
      .first();

    if (!template) {
      logger.logInfo('Could not get PDF template as it does not exist', {
        proposalPdfTemplateId,
      });
    }

    return template ? createProposalPdfTemplateObject(template) : null;
  }

  async delete(proposalPdfTemplateId: number): Promise<ProposalPdfTemplate> {
    const templates: ProposalPdfTemplateRecord[] = await database(
      'proposal_pdf_templates'
    )
      .where({ proposal_pdf_template_id: proposalPdfTemplateId })
      .delete('*');

    if (templates.length !== 1) {
      logger.logError('Could not delete PDF template', {
        proposalPdfTemplateId,
      });

      throw new GraphQLError('Could not delete PDF template');
    }

    return createProposalPdfTemplateObject(templates[0]);
  }

  async updatePdfTemplate(
    args: UpdateProposalPdfTemplateArgs
  ): Promise<ProposalPdfTemplate> {
    const templates: ProposalPdfTemplateRecord[] = await database(
      'proposal_pdf_templates'
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
      .where({ proposal_pdf_template_id: args.proposalPdfTemplateId });

    if (templates.length !== 1) {
      logger.logError('Could not update PDF template', { args });

      throw new GraphQLError('Could not update PDF template');
    }

    return createProposalPdfTemplateObject(templates[0]);
  }

  async clonePdfTemplate(
    sourceTemplateId: number,
    newTemplateId: number
  ): Promise<ProposalPdfTemplate> {
    const sourceTemplate: ProposalPdfTemplateRecord | undefined =
      await database('proposal_pdf_templates')
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
    args: ProposalPdfTemplatesArgs
  ): Promise<ProposalPdfTemplate[]> {
    const filter = args.filter;

    const templates: ProposalPdfTemplateRecord[] = await database(
      'proposal_pdf_templates'
    )
      .modify((query) => {
        if (filter?.proposalPdfTemplateIds) {
          query.where(
            'proposal_pdf_template_id',
            'in',
            filter.proposalPdfTemplateIds
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
      createProposalPdfTemplateObject(template)
    );
  }
}
