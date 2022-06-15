import { Ctx, Mutation, Resolver, Field, InputType, Arg } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { SettingsId } from '../../../models/Settings';
import { SettingsResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

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
  @Mutation(() => SettingsResponseWrap)
  async updateSettings(
    @Ctx() context: ResolverContext,
    @Arg('updatedSettingsInput')
    updatedSettingsInput: UpdateSettingsInput
  ) {
    return wrapResponse(
      context.mutations.admin.updateSettings(
        context.user,
        updatedSettingsInput
      ),
      SettingsResponseWrap
    );
  }
}
