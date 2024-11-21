import {
  Query,
  Arg,
  Ctx,
  Resolver,
  Int,
  Field,
  ObjectType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Technique } from '../types/Technique';

@ObjectType()
class TechniquesQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Technique])
  public techniques: Technique[];
}

@Resolver()
export class TechniqueQuery {
  @Query(() => Technique, { nullable: true })
  technique(
    @Arg('techniqueId', () => Int) techniqueId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.technique.get(context.user, techniqueId);
  }

  @Query(() => TechniquesQueryResult, { nullable: true })
  techniques(@Ctx() context: ResolverContext) {
    return context.queries.technique.getAll(context.user);
  }

  @Query(() => [Technique], { nullable: true })
  techniquesByIds(
    @Arg('techniqueIds', () => [Int]) techniqueIds: number[],
    @Ctx() context: ResolverContext
  ) {
    return context.queries.technique.getTechniquesByIds(
      context.user,
      techniqueIds
    );
  }

  @Query(() => [Technique], { nullable: true })
  techniquesByScientist(
    @Arg('userNumber', () => Int) userNumber: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.technique.getTechniquesByScientist(
      context.user,
      userNumber
    );
  }
}
