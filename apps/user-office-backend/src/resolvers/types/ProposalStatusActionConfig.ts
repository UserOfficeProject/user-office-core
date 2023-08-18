import { Field, ObjectType, createUnionType } from 'type-graphql';

export enum EmailStatusActionRecipients {
  PI = 'PI',
  CO_PROPOSERS = 'CO_PROPOSERS',
  INSTRUMENT_SCIENTISTS = 'INSTRUMENT_SCIENTISTS',
  SEP_REVIEWERS = 'SEP_REVIEWERS',
}

@ObjectType()
export class EmailStatusActionRecipientsWithTemplate {
  @Field(() => EmailStatusActionRecipients)
  recipient: EmailStatusActionRecipients;

  @Field(() => String)
  email_template: string;
}

@ObjectType()
export class ProposalStatusActionConfigBase {}

@ObjectType()
export class EmailActionConfig extends ProposalStatusActionConfigBase {
  @Field(() => [EmailStatusActionRecipientsWithTemplate], { nullable: true })
  recipientsWithTemplate: EmailStatusActionRecipientsWithTemplate[] | null;
}

@ObjectType()
export class RabbitMQActionConfig extends ProposalStatusActionConfigBase {}

export const ProposalStatusActionConfig = createUnionType({
  name: 'ProposalStatusActionConfig', // the name of the GraphQL union
  types: () => [EmailActionConfig, RabbitMQActionConfig], // function that returns array of object types classes
});
