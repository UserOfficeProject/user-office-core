const postgresDatasourceTemplate = name =>
  `/* eslint-disable @typescript-eslint/camelcase */
import { ${name.capitalize()} } from '../../models/${name.capitalize()}';
import { Create${name.capitalize()}Args } from '../../resolvers/mutations/Create${name.capitalize()}Mutation';
import { ${name.capitalize()}DataSource } from '../${name.capitalize()}DataSource';
import database from './database';
import { ${name.capitalize()}Record } from './records';

export default class Postgres${name.capitalize()}DataSource implements ${name.capitalize()}DataSource {
  private create${name.capitalize()}Object(${name}: ${name.capitalize()}Record) {
    return new ${name.capitalize()}(
      // Your ${name} here.
    );
  }

  async create(args: Create${name.capitalize()}Args): Promise<${name.capitalize()}> {
    return database
      .insert(args)
      .into('${name}s')
      .returning(['*'])
      .then((${name}: ${name.capitalize()}Record[]) => {
        if (${name}.length !== 1) {
          throw new Error('Could not create ${name}');
        }

        return this.create${name.capitalize()}Object(${name}[0]);
      });
  }

  async get(${name}Id: number): Promise<${name.capitalize()} | null> {
    return database
      .select()
      .from('${name}s')
      .where('${name}_id', ${name}Id)
      .first()
      .then((${name}: ${name.capitalize()}Record | null) =>
        ${name} ? this.create${name.capitalize()}Object(${name}) : null
      );
  }

  async getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; ${name}s: ${name.capitalize()}[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('${name}s')
      .orderBy('${name}_id', 'desc')
      .modify(query => {
        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((${name}s: ${name.capitalize()}Record[]) => {
        const result = ${name}s.map(${name} => this.create${name.capitalize()}Object(${name}));

        return {
          totalCount: ${name}s[0] ? ${name}s[0].full_count : 0,
          ${name}s: result,
        };
      });
  }

  async update(${name}: ${name.capitalize()}): Promise<${name.capitalize()}> {
    return database
      .update(
        ${name},
        ['*']
      )
      .from('${name}s')
      .where('${name}_id', ${name}.${name}Id)
      .then((records: ${name.capitalize()}Record[]) => {
        if (records === undefined || !records.length) {
          throw new Error(\`${name.capitalize()} not found \${${name}.${name}Id}\`);
        }

        return this.create${name.capitalize()}Object(records[0]);
      });
  }

  async delete(${name}Id: number): Promise<${name.capitalize()}> {
    return database('${name}s')
      .where('${name}s.${name}_id', ${name}Id)
      .del()
      .from('${name}s')
      .returning('*')
      .then((${name}: ${name.capitalize()}Record[]) => {
        if (${name} === undefined || ${name}.length !== 1) {
          throw new Error(\`Could not delete ${name} with id: \${${name}Id} \`);
        }

        return this.create${name.capitalize()}Object(${name}[0]);
      });
  }
}
`;

const datasourceTemplate = name =>
  `/* eslint-disable @typescript-eslint/camelcase */
import { ${name.capitalize()} } from '../models/${name.capitalize()}';
import { Create${name.capitalize()}Args } from '../resolvers/mutations/Create${name.capitalize()}Mutation';

export interface ${name.capitalize()}DataSource {
  create(args: Create${name.capitalize()}Args): Promise<${name.capitalize()}>;
  get(${name}Id: number): Promise<${name.capitalize()} | null>;
  getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; ${name}s: ${name.capitalize()}[] }>;
  update(${name}: ${name.capitalize()}): Promise<${name.capitalize()}>;
  delete(${name}Id: number): Promise<${name.capitalize()}>;
}
`;

const testingDatasourceTemplate = name =>
  `import { ${name.capitalize()} } from '../../models/${name.capitalize()}';
import { Create${name.capitalize()}Args } from '../../resolvers/mutations/Create${name.capitalize()}Mutation';
import { ${name.capitalize()}DataSource } from '../${name.capitalize()}DataSource';

export const dummy${name.capitalize()} = new ${name.capitalize()}(
  
);

export class ${name.capitalize()}DataSourceMock implements ${name.capitalize()}DataSource {
  async create(args: Create${name.capitalize()}Args): Promise<${name.capitalize()}> {
    return dummy${name.capitalize()};
  }

  async get(${name}Id: number): Promise<${name.capitalize()} | null> {
    return dummy${name.capitalize()};
  }

  async getAll(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; ${name}s: ${name.capitalize()}[] }> {
    return { totalCount: 1, ${name}s: [dummy${name.capitalize()}] };
  }

  async update(${name}: ${name.capitalize()}): Promise<${name.capitalize()}> {
    return dummy${name.capitalize()};
  }

  async delete(${name}Id: number): Promise<${name.capitalize()}> {
    return dummy${name.capitalize()};
  }
}
`;

module.exports = {
  postgresDatasourceTemplate,
  datasourceTemplate,
  testingDatasourceTemplate,
};
