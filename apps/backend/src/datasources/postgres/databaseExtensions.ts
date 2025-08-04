import Knex from 'knex';

const escapeLike = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/[%_]/g, '\\$&');

const addExtensions = () => {
  // Add the custom methods
  Knex.QueryBuilder.extend(
    'whereILikeEscaped',
    function (column: string, userInput: string) {
      const escapedInput = escapeLike(userInput);

      return this.whereILike(column, escapedInput);
    }
  );
  Knex.QueryBuilder.extend(
    'orWhereILikeEscaped',
    function (column: string, userInput: string) {
      const escapedInput = escapeLike(userInput);

      return this.orWhereILike(column, escapedInput);
    }
  );
};

export default addExtensions;
