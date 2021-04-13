import { Field, ObjectType } from 'type-graphql';

import { Settings as SettingsOrigin, SettingsId } from '../../models/Settings';
@ObjectType()
export class Settings implements Partial<SettingsOrigin> {
  @Field(() => SettingsId)
  public id: SettingsId;

  @Field()
  public isEnabled: boolean;

  @Field()
  public description: string;
}
