import { ObjectType, Resolver } from 'type-graphql';

import { Template } from './Template';

@ObjectType()
export class ShipmentTemplate extends Template {}

@Resolver((of) => ShipmentTemplate)
export class ShipmentResolver {}
