import { Field, ObjectType, createUnionType } from 'type-graphql';

export enum EmailStatusActionRecipients {
  PI = 'PI',
  CO_PROPOSERS = 'CO_PROPOSERS',
  INSTRUMENT_SCIENTISTS = 'INSTRUMENT_SCIENTISTS',
  FAP_REVIEWERS = 'FAP_REVIEWERS',
  OTHER = 'OTHER',
}

export const EmailStatusActionRecipientsWithDescription = new Map<
  EmailStatusActionRecipients,
  string
>([
  [EmailStatusActionRecipients.PI, 'Principal investigator on the proposal'],
  [EmailStatusActionRecipients.CO_PROPOSERS, 'Co-proposers on the proposal'],
  [
    EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS,
    'Instrument scientists including the manager on the instrument related to the proposal',
  ],
  [
    EmailStatusActionRecipients.FAP_REVIEWERS,
    'Fap reviewers that are assigned to review the proposal',
  ],
  [
    EmailStatusActionRecipients.OTHER,
    'Other email recipients manually added by their email',
  ],
]);

@ObjectType()
export class EmailStatusActionRecipient {
  @Field(() => EmailStatusActionRecipients)
  public name: EmailStatusActionRecipients;

  @Field(() => String, { nullable: true })
  public description?: string;
}
@ObjectType()
export class EmailStatusActionEmailTemplate {
  @Field(() => String)
  public id: string;

  @Field(() => String)
  public name?: string;
}

@ObjectType()
export class EmailStatusActionRecipientsWithTemplate {
  @Field(() => EmailStatusActionRecipient)
  recipient: EmailStatusActionRecipient;

  @Field(() => EmailStatusActionEmailTemplate)
  emailTemplate: EmailStatusActionEmailTemplate;

  @Field(() => [String], { nullable: true })
  otherRecipientEmails?: string[];
}

@ObjectType()
export class ProposalStatusActionConfigBase {}

@ObjectType()
export class EmailActionConfig extends ProposalStatusActionConfigBase {
  @Field(() => [EmailStatusActionRecipientsWithTemplate])
  recipientsWithEmailTemplate: EmailStatusActionRecipientsWithTemplate[];
}

@ObjectType()
export class RabbitMQActionConfig extends ProposalStatusActionConfigBase {
  @Field(() => [String], { nullable: true })
  exchanges?: string[] | null;
}

export const ProposalStatusActionConfig = createUnionType({
  name: 'ProposalStatusActionConfig', // the name of the GraphQL union
  types: () => [EmailActionConfig, RabbitMQActionConfig], // function that returns array of object types classes
});

// NOTE: Default config starts here
@ObjectType()
export class EmailActionDefaultConfig extends ProposalStatusActionConfigBase {
  constructor(
    recipients: EmailStatusActionRecipient[],
    emailTemplates: EmailStatusActionEmailTemplate[]
  ) {
    super();
    this.recipients = recipients;
    this.emailTemplates = emailTemplates;
  }

  @Field(() => [EmailStatusActionRecipient])
  recipients: EmailStatusActionRecipient[];

  @Field(() => [EmailStatusActionEmailTemplate])
  emailTemplates: EmailStatusActionEmailTemplate[];
}

@ObjectType()
export class RabbitMQActionDefaultConfig extends ProposalStatusActionConfigBase {
  constructor(exchanges: string[] | null) {
    super();
    this.exchanges = exchanges;
  }

  @Field(() => [String], { nullable: true })
  exchanges?: string[] | null;
}

export const ProposalStatusActionDefaultConfig = createUnionType({
  name: 'ProposalStatusActionDefaultConfig', // the name of the GraphQL union
  types: () => [EmailActionDefaultConfig, RabbitMQActionDefaultConfig], // function that returns array of object types classes
});
