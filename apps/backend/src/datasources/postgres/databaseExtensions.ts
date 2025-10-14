import Knex from 'knex';

const escapeLike = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');

function safeJsonPath(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\"]/g, '\\$&').trim();
}

const addExtensions = () => {
  // Add the custom methods
  Knex.QueryBuilder.extend(
    'whereILikeEscaped',
    function (column: string, query: string, userInput: string) {
      const escapedInput = escapeLike(userInput);
      const finalQuery = query.replace(/\?/g, escapedInput);

      return this.whereILike(column, finalQuery);
    }
  );
  Knex.QueryBuilder.extend(
    'orWhereILikeEscaped',
    function (column: string, query: string, userInput: string) {
      const escapedInput = escapeLike(userInput);
      const finalQuery = query.replace(/\?/g, escapedInput);

      return this.orWhereILike(column, finalQuery);
    }
  );
  Knex.QueryBuilder.extend(
    'whereJsonFieldLikeEscaped',
    function (column: string, field: string, userInput: string) {
      const escapedInput = safeJsonPath(userInput);
      const jsonPath = `$[*].${field}? (@ like_regex "${escapedInput}" flag "i")`;

      return this.whereRaw('jsonb_path_exists(??, ?)', [column, jsonPath]);
    }
  );
  Knex.QueryBuilder.extend(
    'orWhereJsonFieldLikeEscaped',
    function (column: string, userInput: string) {
      const escapedInput = safeJsonPath(userInput);
      const jsonPath = `$[*].name ? (@ like_regex "${escapedInput}" flag "i")`;

      return this.orWhereRaw('jsonb_path_exists(??, ?)', [column, jsonPath]);
    }
  );
};

export default addExtensions;
