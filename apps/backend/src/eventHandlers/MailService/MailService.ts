import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { logger } from '@user-office-software/duo-logger';
import EmailTemplates from 'email-templates';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { EmailTemplateDataSource } from '../../datasources/EmailTemplateDataSource';
import EmailSettings from './EmailSettings';
import { ResultsPromise } from './SparkPost';

export abstract class MailService {
  protected emailTemplates: EmailTemplates<any>;

  abstract sendMail(options: EmailSettings): ResultsPromise<SendMailResults>;
  abstract getEmailTemplates(
    includeDraft?: boolean
  ): ResultsPromise<
    (SparkPostTemplate | STFCEmailTemplate | ELIEmailTemplate)[]
  >;

  getEmailTemplatePath(type: string, template: string): string {
    return path.join(
      process.env.EMAIL_TEMPLATE_PATH || '',
      `${template}.${type}`
    );
  }

  async getEmailTemplate(
    options: EmailSettings
  ): Promise<{ name: string; path: string } | null> {
    const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
      Tokens.EmailTemplateDataSource
    );

    if (process.env.NODE_ENV === 'test') {
      return { name: options.content.template_id, path: '' };
    }

    if (options.content.db_template_id) {
      const emailTemplate = await emailTemplateDataSource.getEmailTemplate(
        options.content.db_template_id
      );

      if (!emailTemplate) {
        return null;
      }

      const tempDirPath = path.join(tmpdir(), 'email-templates');

      try {
        const tempDir = mkdtempSync(tempDirPath);
        const tempFilePath = path.join(tempDir, emailTemplate.id.toString());

        logger.logInfo('Creating email template', {
          templateId: options.content.db_template_id,
          dbTemplateId: options.content.db_template_id,
          tempFilePath,
        });

        writeFileSync(tempFilePath + '.html.pug', emailTemplate.body);

        writeFileSync(
          tempFilePath + '.subject.pug',
          '= `' + emailTemplate.subject + '`'
        );

        if (
          !(await (this.emailTemplates as any).templateExists(
            tempFilePath + '.html.pug'
          ))
        ) {
          logger.logWarn('Email template does not exist', {
            templateId: options.content.db_template_id,
            dbTemplateId: options.content.db_template_id,
            tempFilePath,
          });

          return null;
        }

        return { name: emailTemplate.name, path: tempFilePath };
      } catch (err) {
        logger.logWarn('Could not create email template', {
          error: err,
        });

        return null;
      }
    } else {
      const templatePath =
        this.getEmailTemplatePath('html', options.content.template_id) + '.pug';

      if (!(await (this.emailTemplates as any).templateExists(templatePath))) {
        return null;
      }

      return {
        name: options.content.template_id,
        path: path.join(
          process.env.EMAIL_TEMPLATE_PATH || '',
          options.content.template_id
        ),
      };
    }
  }
}

export type SparkPostTemplate = {
  last_use: string;
  description: string;
  id: string;
  has_draft: boolean;
  published: boolean;
  name: string;
  shared_with_subaccounts: boolean;
  has_published: boolean;
  last_update_time: string;
};

export type STFCEmailTemplate = {
  id: string;
  name: string;
};

export type ELIEmailTemplate = {
  id: string;
  name: string;
};

export type SendMailResults = {
  total_rejected_recipients: number;
  total_accepted_recipients: number;
  id: string;
};
