import { Field, ObjectType, createUnionType } from 'type-graphql';

export enum EmailStatusActionRecipients {
  PI = 'PI',
  CO_PROPOSERS = 'CO_PROPOSERS',
  INSTRUMENT_SCIENTISTS = 'INSTRUMENT_SCIENTISTS',
  SEP_REVIEWERS = 'SEP_REVIEWERS',
}

@ObjectType()
export class ProposalStatusActionConfigBase {}

@ObjectType()
export class EmailActionConfig extends ProposalStatusActionConfigBase {
  @Field(() => EmailStatusActionRecipients, { nullable: true })
  recipients: EmailStatusActionRecipients | null;

  @Field(() => String)
  email_template: string;
}

@ObjectType()
export class RabbitMQActionConfig extends ProposalStatusActionConfigBase {}

export const ProposalStatusActionConfig = createUnionType({
  name: 'ProposalStatusActionConfig', // the name of the GraphQL union
  types: () => [EmailActionConfig, RabbitMQActionConfig], // function that returns array of object types classes
});
