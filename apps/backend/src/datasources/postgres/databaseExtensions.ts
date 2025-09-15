import Knex from 'knex';

const escapeLike = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');

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
};

export default addExtensions;
