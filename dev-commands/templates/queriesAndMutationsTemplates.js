const queriesTemplate = name =>
  `import { ${name.capitalize()}DataSource } from '../datasources/${name.capitalize()}DataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';

export default class ${name.capitalize()}Queries {
  constructor(private dataSource: ${name.capitalize()}DataSource) {}

  @Authorized()
  async get(agent: UserWithRole | null, id: number) {
    const ${name} = await this.dataSource.get(id);

    return ${name};
  }

  @Authorized()
  async getAll(agent: UserWithRole | null, filter?: ${name.capitalize()}sFilter) {
    const ${name}s = await this.dataSource.getAll();

    return ${name}s;
  }
}
`;

const mutationsTemplate = name =>
  `import { create${name.capitalize()}ValidationSchema } from '@esss-swap/duo-validation';

import { ${name.capitalize()}DataSource } from '../datasources/${name.capitalize()}DataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { ${name.capitalize()} } from '../models/${name.capitalize()}';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { Create${name.capitalize()}Args } from '../resolvers/mutations/Create${name.capitalize()}Mutation';
import { Update${name.capitalize()}Args } from '../resolvers/mutations/Update${name.capitalize()}Mutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class ${name.capitalize()}Mutations {
  constructor(
    private dataSource: ${name.capitalize()}DataSource,
    private userAuth: UserAuthorization
  ) {}

  @ValidateArgs(create${name.capitalize()}ValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: Create${name.capitalize()}Args
  ): Promise<${name.capitalize()} | Rejection> {
    return this.dataSource
      .create(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not create ${name}', error, {
          agent,
          ${name}Id: args.${name}Id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(update${name.capitalize()}ValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: Update${name.capitalize()}Args
  ): Promise<${name.capitalize()} | Rejection> {
    return this.dataSource
      .update(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not update ${name}', error, {
          agent,
          ${name}Id: args.${name}Id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(delete${name.capitalize()}ValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { ${name}Id: number }
  ): Promise<${name.capitalize()} | Rejection> {
    return this.dataSource
      .delete(args.${name}Id)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not delete ${name}', error, {
          agent,
          ${name}Id: args.${name}Id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}
`;

module.exports = {
  queriesTemplate,
  mutationsTemplate,
};
