// Detects the variables a pug email template expects, so the preview can offer
// editable sample values for them. Deliberately regex-based rather than a real
// pug parse: it runs on every keystroke, and false positives are harmless
// because every detected key is just an editable (or ignorable) text field.

// `#{expr}` and `!{expr}`. `#[tag]` interpolation is naturally excluded because
// the character class must be followed by `{`.
const INTERPOLATION = /[#!]\{([^}]*)\}/g;
const EACH =
  /^[ \t]*each[ \t]+[\w$]+(?:[ \t]*,[ \t]*[\w$]+)?[ \t]+in[ \t]+(.+)$/gm;
const CONDITIONAL = /^[ \t]*(?:if|unless|else if)[ \t]+(.+)$/gm;
const PUG_COMMENT = /^[ \t]*\/\/-?.*$/gm;

// Dotted identifier chains inside a captured expression.
const IDENTIFIER = /[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/g;

const IGNORED_ROOTS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'this',
  'typeof',
  'instanceof',
  'new',
  'in',
  'of',
  'void',
  'length',
  'Math',
  'JSON',
  'Date',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'console',
]);

// Built-in properties and methods that are read off a value rather than being
// data in their own right. A path is truncated at the first such segment, so
// `coProposers.length` asks for a sample value for `coProposers` and
// `startDate.toISOString` for `startDate`. Without this, a sample value would
// be written over e.g. an array's `length`.
const IGNORED_PROPERTIES = new Set([
  'length',
  'size',
  'toString',
  'toISOString',
  'toLocaleString',
  'toLocaleDateString',
  'toLocaleTimeString',
  'toFixed',
  'valueOf',
  'trim',
  'toUpperCase',
  'toLowerCase',
  'join',
  'map',
  'filter',
  'slice',
  'split',
  'concat',
  'indexOf',
  'includes',
  'charAt',
  'replace',
  'getTime',
  'getFullYear',
]);

export function detectPugVariables(subject: string, body: string): string[] {
  const found = new Set<string>();

  for (const source of [subject ?? '', body ?? '']) {
    const cleaned = source.replace(PUG_COMMENT, '');

    for (const expressionRegex of [INTERPOLATION, EACH, CONDITIONAL]) {
      expressionRegex.lastIndex = 0;

      let match: RegExpExecArray | null;

      while ((match = expressionRegex.exec(cleaned)) !== null) {
        for (const identifier of match[1].match(IDENTIFIER) ?? []) {
          const segments = identifier.split('.');

          if (IGNORED_ROOTS.has(segments[0])) {
            continue;
          }

          const propertyIndex = segments.findIndex((segment, index) =>
            index > 0 ? IGNORED_PROPERTIES.has(segment) : false
          );
          const dataPath =
            propertyIndex === -1 ? segments : segments.slice(0, propertyIndex);

          if (dataPath.length === 0) {
            continue;
          }

          // Keep the remaining dotted path so it lines up with the nested
          // substitution data the backend builds.
          found.add(dataPath.join('.'));
        }
      }
    }
  }

  return Array.from(found).sort();
}
