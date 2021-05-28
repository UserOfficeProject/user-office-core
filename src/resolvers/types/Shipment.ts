import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  Shipment as ShipmentOrigin,
  ShipmentStatus,
} from '../../models/Shipment';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';
import { Sample } from './Sample';

@ObjectType()
export class Shipment implements Partial<ShipmentOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(() => Int)
  public proposalId: number;

  @Field(() => ShipmentStatus)
  public status: ShipmentStatus;

  @Field(() => String, { nullable: true })
  public externalRef: string;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => Shipment)
export class ShipmentResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() shipment: Shipment,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    return context.queries.questionary.getQuestionary(
      context.user,
      shipment.questionaryId
    );
  }

  @FieldResolver(() => [Sample])
  async samples(
    @Root() shipment: Shipment,
    @Ctx() context: ResolverContext
  ): Promise<Sample[] | null> {
    return context.queries.sample.getSamplesByShipmentId(
      context.user,
      shipment.id
    );
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() shipment: Shipment,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    const proposal = await context.queries.proposal.get(
      context.user,
      shipment.proposalId
    );

    return proposal;
  }
}
