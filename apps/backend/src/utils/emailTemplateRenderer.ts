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

export type TemplateVariable = {
  key: string;
  value: string;
};

const SAFE_TEMPLATE_NAME = /^[A-Za-z0-9._-]+$/;
const SAFE_IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export const MAX_TEMPLATE_SOURCE_LENGTH = 100_000;
const MAX_VARIABLES = 200;
const MAX_VALUE_LENGTH = 2000;

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

function coerceSampleValue(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildSubstitutionData(
  variables: TemplateVariable[]
): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const { key, value } of variables.slice(0, MAX_VARIABLES)) {
    const segments = key.split('.');

    const isSafe = segments.every(
      (segment) => SAFE_IDENTIFIER.test(segment) && !FORBIDDEN_KEYS.has(segment)
    );

    if (!isSafe) {
      continue;
    }

    let node = root;
    let canAssign = true;

    for (const segment of segments.slice(0, -1)) {
      const child = node[segment];

      if (child === undefined || child === null) {
        node[segment] = {};
      } else if (!isPlainObject(child)) {
        canAssign = false;
        break;
      }

      node = node[segment] as Record<string, unknown>;
    }

    if (!canAssign) {
      continue;
    }

    const leaf = segments[segments.length - 1];
    const coerced = coerceSampleValue(value.slice(0, MAX_VALUE_LENGTH));

    try {
      node[leaf] = coerced;
    } catch {
      continue;
    }
  }

  return root;
}
