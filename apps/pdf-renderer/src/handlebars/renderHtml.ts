import Handlebars from 'handlebars';

import { registerHelpers } from './helpers';

/**
 * Stage 1 of the pipeline: Handlebars template + data -> HTML string.
 */

export type TemplateEngine = typeof Handlebars;

/**
 * Creates an isolated Handlebars environment with the PDF helper set.
 *
 * Isolation matters because helpers registered on the global Handlebars object
 * leak across callers and across tests.
 */
export function createTemplateEngine(): TemplateEngine {
  const env = Handlebars.create();
  registerHelpers(env);

  return env;
}

const defaultEngine = createTemplateEngine();

/**
 * Compiles a Handlebars template against `data`.
 *
 * @throws when the template cannot be parsed or a helper throws, with the
 * Handlebars message preserved so template authors get a usable error.
 */
export function renderHtml(
  template: string,
  data: Record<string, unknown>,
  engine: TemplateEngine = defaultEngine
): string {
  let compiled: HandlebarsTemplateDelegate;

  try {
    // Handlebars parses lazily on first call, so parse up front to keep a
    // template syntax error distinguishable from a data or helper error.
    compiled = engine.compile(engine.parse(template));
  } catch (error) {
    throw new Error(
      `Failed to parse Handlebars template: ${(error as Error).message}`
    );
  }

  try {
    return compiled(data);
  } catch (error) {
    throw new Error(
      `Failed to render Handlebars template: ${(error as Error).message}`
    );
  }
}
