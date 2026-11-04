import { readFileSync } from 'node:fs';
import path from 'path';

import pug from 'pug';

export type EmailTemplateSource = {
  subject: string;
  body: string;
};

export type RenderErrorSource = 'SUBJECT' | 'BODY' | 'TEMPLATE_FILE';

export type RenderError = {
  source: RenderErrorSource;
  message: string;
  line?: number;
  column?: number;
};

export type RenderResult =
  | { subject: string; body: string }
  | { error: RenderError };

const SAFE_TEMPLATE_NAME = /^[A-Za-z0-9._-]+$/;

export const MAX_TEMPLATE_SOURCE_LENGTH = 100_000;

const PUG_OPTIONS: pug.Options = { cache: false, doctype: 'html' };

export function getEmailTemplateFilePath(
  type: 'html' | 'subject',
  templateName: string
): string {
  if (!SAFE_TEMPLATE_NAME.test(templateName)) {
    throw new Error(`Invalid email template name: ${templateName}`);
  }

  const root = path.resolve(process.env.EMAIL_TEMPLATE_PATH || '');
  const resolved = path.resolve(root, `${templateName}.${type}.pug`);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error('Email template path escapes EMAIL_TEMPLATE_PATH');
  }

  return resolved;
}

export function readEmailTemplateSourceFromFiles(
  templateName: string
): EmailTemplateSource {
  return {
    body: readFileSync(getEmailTemplateFilePath('html', templateName), 'utf-8'),
    subject: readFileSync(
      getEmailTemplateFilePath('subject', templateName),
      'utf-8'
    ),
  };
}

export function renderEmailTemplate(
  source: EmailTemplateSource,
  data: Record<string, unknown>
): RenderResult {
  let stage: RenderErrorSource = 'SUBJECT';

  try {
    const subject = pug.render(source.subject, { ...PUG_OPTIONS, ...data });
    stage = 'BODY';
    const body = pug.render(source.body, { ...PUG_OPTIONS, ...data });

    return { subject, body };
  } catch (error) {
    if (error instanceof Error) {
      const pugError = error as Error & { line?: number; column?: number };

      return {
        error: {
          source: stage,
          message: pugError.message,
          line: pugError.line,
          column: pugError.column,
        },
      };
    }

    return {
      error: {
        source: stage,
        message: String(error),
      },
    };
  }
}
