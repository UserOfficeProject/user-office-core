import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class ProposalUiPermissions {
  @Field(() => Boolean)
  public canDelete: boolean;

  @Field(() => Boolean)
  public canUpdate: boolean;
}

// Map of UI permissions to Casbin actions
export const PROPOSAL_ACTIONS: Record<keyof ProposalUiPermissions, string> = {
  canDelete: 'delete',
  canUpdate: 'update',
};
