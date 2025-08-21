import { writeFileSync } from 'node:fs';
import path from 'node:path';

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

  async getTemplateId(options: EmailSettings): Promise<string | null> {
    const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
      Tokens.EmailTemplateDataSource
    );

    if (process.env.NODE_ENV === 'test') {
      return options.content.template_id;
    }

    if (options.content.db_template_id) {
      const templateId = 'temp_template';

      const emailTemplate = await emailTemplateDataSource.getEmailTemplate(
        options.content.db_template_id
      );

      if (!emailTemplate) {
        return null;
      }

      writeFileSync(
        path.join(
          process.env.EMAIL_TEMPLATE_PATH || '',
          templateId + '.html.pug'
        ),
        emailTemplate.body
      );

      writeFileSync(
        path.join(
          process.env.EMAIL_TEMPLATE_PATH || '',
          templateId + '.subject.pug'
        ),
        '= `' + emailTemplate.subject + '`'
      );

      return templateId;
    } else {
      const template =
        this.getEmailTemplatePath('html', options.content.template_id) + '.pug';

      if (!(await (this.emailTemplates as any).templateExists(template))) {
        return null;
      }

      return options.content.template_id;
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
