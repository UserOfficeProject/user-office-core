import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class CallUiPermissions {
  @Field(() => Boolean)
  public canArchive: boolean;
}

// Map of UI permissions to Casbin actions
export const CALL_ACTIONS: Record<keyof CallUiPermissions, string> = {
  canArchive: 'archive',
};
