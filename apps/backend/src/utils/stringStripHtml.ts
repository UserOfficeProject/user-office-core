export function stripHtml(input: string): string {
  let result = '';
  let pendingSpace = false;
  let ignoredTagName: string | null = null;

  for (let index = 0; index < input.length; index++) {
    if (input[index] === '<') {
      const parsedTag = parseTag(input, index);

      if (parsedTag) {
        index = parsedTag.endsAt;

        if (ignoredTagName) {
          if (parsedTag.isClosing && parsedTag.name === ignoredTagName) {
            ignoredTagName = null;
          }

          continue;
        }

        if (!parsedTag.isClosing && IGNORE_TAG_CONTENTS.has(parsedTag.name)) {
          ignoredTagName = parsedTag.name;

          continue;
        }

        if (shouldInsertSpace(result)) {
          pendingSpace = true;
        }

        continue;
      }
    }

    if (ignoredTagName) {
      continue;
    }

    const currentCharacter = input[index];

    if (pendingSpace && !isWhitespace(currentCharacter)) {
      result += ' ';
    }

    result += currentCharacter;
    pendingSpace = false;
  }

  return decodeHtmlEntities(result);
}

const IGNORE_TAG_CONTENTS = new Set(['script', 'style']);
const APOSTROPHE = String.fromCharCode(39);
function isTagNameChar(code: number): boolean {
  return (
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    (code >= 48 && code <= 57) || // 0-9
    code === 58 || // :
    code === 45 // -
  );
}
const WHITESPACE_CHARACTER = /\s/;
const HTML_ENTITY_PATTERN =
  /&(#(?:x[\dA-Fa-f]+|\d+)|nbsp|amp|lt|gt|quot|apos);/g;

type ParsedTag = {
  endsAt: number;
  isClosing: boolean;
  name: string;
};

function parseTag(input: string, startIndex: number): ParsedTag | null {
  let currentIndex = startIndex + 1;
  let isClosing = false;

  if (input[currentIndex] === '/') {
    isClosing = true;
    currentIndex += 1;
  }

  const firstCode = input.charCodeAt(currentIndex);

  if (
    !(
      (firstCode >= 65 && firstCode <= 90) ||
      (firstCode >= 97 && firstCode <= 122)
    )
  ) {
    return null;
  }

  const nameStart = currentIndex;

  while (
    currentIndex < input.length &&
    isTagNameChar(input.charCodeAt(currentIndex))
  ) {
    currentIndex += 1;
  }

  const name = input.slice(nameStart, currentIndex).toLowerCase();
  let quoteCharacter: string | null = null;

  while (currentIndex < input.length) {
    const currentCharacter = input[currentIndex];

    if (quoteCharacter) {
      if (currentCharacter === quoteCharacter) {
        quoteCharacter = null;
      }
    } else if (currentCharacter === '"' || currentCharacter === APOSTROPHE) {
      quoteCharacter = currentCharacter;
    } else if (currentCharacter === '>') {
      return {
        endsAt: currentIndex,
        isClosing,
        name,
      };
    }

    currentIndex += 1;
  }

  return null;
}

function shouldInsertSpace(currentResult: string): boolean {
  return (
    currentResult.length > 0 &&
    !isWhitespace(currentResult[currentResult.length - 1])
  );
}

function decodeHtmlEntities(value: string): string {
  return value.replace(HTML_ENTITY_PATTERN, (match, entity) => {
    if (entity === 'nbsp') {
      return '\u00A0';
    }

    if (entity === 'amp') {
      return '&';
    }

    if (entity === 'lt') {
      return '<';
    }

    if (entity === 'gt') {
      return '>';
    }

    if (entity === 'quot') {
      return '"';
    }

    if (entity === 'apos') {
      return APOSTROPHE;
    }

    const codePoint = entity.startsWith('#x')
      ? parseInt(entity.slice(2), 16)
      : parseInt(entity.slice(1), 10);

    return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
  });
}

function isWhitespace(value: string): boolean {
  return WHITESPACE_CHARACTER.test(value);
}
