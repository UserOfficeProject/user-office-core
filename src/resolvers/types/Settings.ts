import { Field, ObjectType } from 'type-graphql';

import { Settings as SettingsOrigin, SettingsId } from '../../models/Settings';
@ObjectType()
export class Settings implements Partial<SettingsOrigin> {
  @Field(() => SettingsId)
  public id: SettingsId;

  @Field()
  public addValue: string;

  @Field()
  public description: string;
}
