import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { Call } from './Call';
import { Instrument } from './Instrument';
import { ResolverContext } from '../../context';
import { Tag as TagBase } from '../../models/Tag';

@ObjectType()
export class Tag implements TagBase {
  @Field(() => Int)
  public id: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;
}

@Resolver(() => Tag)
export class TagResolver {
  @FieldResolver(() => [Instrument])
  async instruments(@Root() tag: Tag, @Ctx() context: ResolverContext) {
    return context.queries.tag.dataSource.getTagInstruments(tag.id);
  }

  @FieldResolver(() => [Call])
  async calls(@Root() tag: Tag, @Ctx() context: ResolverContext) {
    return context.queries.tag.dataSource.getTagCalls(tag.id);
  }
}
