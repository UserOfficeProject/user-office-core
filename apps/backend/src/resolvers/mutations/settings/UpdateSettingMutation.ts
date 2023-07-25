import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { SettingsId } from '../../../models/Settings';
import { Settings } from '../../types/Settings';

@InputType()
export class UpdateSettingsInput {
  @Field(() => SettingsId)
  public settingsId: SettingsId;

  @Field(() => String, { nullable: true })
  public description?: string;

  @Field(() => String, { nullable: true })
  public settingsValue?: string;
}

@Resolver()
export class UpdateSettingsMutation {
  @Mutation(() => Settings)
  async updateSettings(
    @Ctx() context: ResolverContext,
    @Arg('updatedSettingsInput')
    updatedSettingsInput: UpdateSettingsInput
  ) {
    return context.mutations.admin.updateSettings(
      context.user,
      updatedSettingsInput
    );
  }
}
