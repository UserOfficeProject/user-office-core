import { Field, ObjectType } from 'type-graphql';

import { Settings as SettingsOrigin, SettingsId } from '../../models/Settings';
@ObjectType()
export class Settings implements Partial<SettingsOrigin> {
  @Field(() => SettingsId)
  public id: SettingsId;

  @Field({ nullable: true })
  public settingsValue: string;

  @Field({ nullable: true })
  public description: string;
}
