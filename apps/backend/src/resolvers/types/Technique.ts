import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
  Directive,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { Technique as TechniqueOrigin } from '../../models/Technique';
import { Instrument } from './Instrument';

@ObjectType()
@Directive('@key(fields: "id")')
export class Technique implements Partial<TechniqueOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public name: string;

  @Field()
  public shortCode: string;

  @Field()
  public description: string;
}

@Resolver(() => Technique)
export class TechniqueResolver {
  @FieldResolver(() => [Instrument])
  async instruments(
    @Root() technique: Technique,
    @Ctx() context: ResolverContext
  ): Promise<Instrument[] | null> {
    const instruments =
      context.queries.technique.dataSource.getInstrumentsByTechniqueId(
        technique.id
      );

    return isRejection(instruments) ? [] : instruments;
  }
}
