import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EmailTemplateDataSource } from '../datasources/EmailTemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { EmailTemplatePreviewInput } from '../resolvers/queries/EmailTemplatePreviewQuery';
import { EmailTemplatesFilter } from '../resolvers/queries/EmailTemplatesQuery';
import {
  EmailTemplatePreview,
  EmailTemplatePreviewError,
} from '../resolvers/types/EmailTemplatePreview';
import {
  buildSubstitutionData,
  EmailTemplateSource,
  MAX_TEMPLATE_SOURCE_LENGTH,
  readEmailTemplateSourceFromFiles,
  renderEmailTemplate,
} from '../utils/emailTemplateRenderer';

@injectable()
export default class EmailTemplateQueries {
  constructor(
    @inject(Tokens.EmailTemplateDataSource)
    public dataSource: EmailTemplateDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, id: number) {
    return await this.dataSource.getEmailTemplate(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null, filter: EmailTemplatesFilter) {
    return this.dataSource.getEmailTemplates(filter);
  }

  @Authorized([Roles.USER_OFFICER])
  async preview(
    agent: UserWithRole | null,
    input: EmailTemplatePreviewInput
  ): Promise<EmailTemplatePreview> {
    let source: EmailTemplateSource;

    if (input.useTemplateFile) {
      if (!input.emailTemplateId) {
        return new EmailTemplatePreview({
          error: new EmailTemplatePreviewError(
            'TEMPLATE_FILE',
            'Save the template before previewing a file-based template.'
          ),
        });
      }

      const emailTemplate = await this.dataSource.getEmailTemplate(
        input.emailTemplateId
      );

      if (!emailTemplate) {
        return new EmailTemplatePreview({
          error: new EmailTemplatePreviewError(
            'TEMPLATE_FILE',
            'Email template not found.'
          ),
        });
      }

      try {
        source = readEmailTemplateSourceFromFiles(emailTemplate.name);
      } catch (error) {
        // `error` is unknown: anything can be thrown, including non-Errors
        // like strings or undefined, so never assume `.message` exists.
        return new EmailTemplatePreview({
          error: new EmailTemplatePreviewError(
            'TEMPLATE_FILE',
            error instanceof Error ? error.message : String(error)
          ),
        });
      }
    } else {
      source = {
        subject: input.subject ?? '',
        body: input.body ?? '',
      };
    }

    if (
      source.subject.length + source.body.length >
      MAX_TEMPLATE_SOURCE_LENGTH
    ) {
      return new EmailTemplatePreview({
        error: new EmailTemplatePreviewError(
          'BODY',
          'Template is too large to preview.'
        ),
      });
    }

    const result = renderEmailTemplate(
      source,
      buildSubstitutionData(input.variables ?? [])
    );

    const fileSource = input.useTemplateFile
      ? { sourceSubject: source.subject, sourceBody: source.body }
      : {};

    if ('error' in result) {
      return new EmailTemplatePreview({
        error: new EmailTemplatePreviewError(
          result.error.source,
          result.error.message,
          result.error.line,
          result.error.column
        ),
        ...fileSource,
      });
    }

    return new EmailTemplatePreview({ ...result, ...fileSource });
  }
}
