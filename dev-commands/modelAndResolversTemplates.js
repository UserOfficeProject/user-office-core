const typeTemplate = name =>
  `import { ObjectType } from 'type-graphql';

import { ${name.capitalize()} as ${name.capitalize()}Origin } from '../../models/${name.capitalize()}';

@ObjectType()
export class ${name.capitalize()} implements Partial<${name.capitalize()}Origin> {
  // Your ${name} properties goes here.
}
`;

const modelTemplate = name =>
  `export class ${name.capitalize()} {
  constructor(
    // Your ${name} properties should go here.
  ) {}
}
`;

const createMutationTemplate = name =>
  `import { Args, ArgsType, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ${name.capitalize()}ResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class Create${name.capitalize()}Args {
  // Your input arguments should go here.
}

@Resolver()
export class Create${name.capitalize()}Mutation {
  @Mutation(() => ${name.capitalize()}ResponseWrap)
  async create${name.capitalize()}(
    @Args() args: Create${name.capitalize()}Args,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.${name}.create(context.user, args),
      ${name.capitalize()}ResponseWrap
    );
  }
}
`;

const updateMutationTemplate = name =>
  `import { Args, ArgsType, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ${name.capitalize()}ResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class Update${name.capitalize()}Args {
  // Your input arguments should go here.
}

@Resolver()
export class Update${name.capitalize()}Mutation {
  @Mutation(() => ${name.capitalize()}ResponseWrap)
  async update${name.capitalize()}(
    @Args() args: Update${name.capitalize()}Args,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.${name}.update(context.user, args),
      ${name.capitalize()}ResponseWrap
    );
  }
}
`;

const deleteMutationTemplate = name =>
  `import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ${name.capitalize()}ResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class Delete${name.capitalize()}Mutation {
  @Mutation(() => ${name.capitalize()}ResponseWrap)
  async delete${name.capitalize()}(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.${name}.delete(context.user, { ${name}Id: id }),
      ${name.capitalize()}ResponseWrap
    );
  }
}
`;

const queriesTemplate = name =>
  `import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ${name.capitalize()} } from '../types/${name.capitalize()}';

@Resolver()
export class ${name.capitalize()}Query {
  @Query(() => ${name.capitalize()}, { nullable: true })
  ${name}(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.${name}.get(context.user, id);
  }

  @Query(() => ${name.capitalize()}, { nullable: true })
  ${name}s(@Ctx() context: ResolverContext) {
    return context.queries.${name}.getAll(context.user, {});
  }
}
`;

module.exports = {
  typeTemplate,
  modelTemplate,
  createMutationTemplate,
  updateMutationTemplate,
  deleteMutationTemplate,
  queriesTemplate,
};
