import { Field, ObjectType, createUnionType } from 'type-graphql';

export enum EmailStatusActionRecipients {
  PI = 'PI',
  CO_PROPOSERS = 'CO_PROPOSERS',
  INSTRUMENT_SCIENTISTS = 'INSTRUMENT_SCIENTISTS',
  FAP_REVIEWERS = 'FAP_REVIEWERS',
  FAP_CHAIR_AND_SECRETARY = 'FAP_CHAIR_AND_SECRETARY',
  USER_OFFICE = 'USER_OFFICE',
  TECHNIQUE_SCIENTISTS = 'TECHNIQUE_SCIENTISTS',
  EXPERIMENT_SAFETY_REVIEWERS = 'EXPERIMENT_SAFETY_REVIEWERS',
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
    EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY,
    'The Chair and Secretaries of the FAP this proposal is associated with',
  ],
  [EmailStatusActionRecipients.USER_OFFICE, 'The User Office email address'],
  [
    EmailStatusActionRecipients.TECHNIQUE_SCIENTISTS,
    'The Technique Scentists email address',
  ],
  [
    EmailStatusActionRecipients.EXPERIMENT_SAFETY_REVIEWERS,
    'The Experiment Safety email address',
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

  @Field(() => Boolean, { nullable: true })
  combineEmails?: boolean;
}

@ObjectType()
export class StatusActionConfigBase {}

@ObjectType()
export class EmailActionConfig extends StatusActionConfigBase {
  @Field(() => [EmailStatusActionRecipientsWithTemplate])
  recipientsWithEmailTemplate: EmailStatusActionRecipientsWithTemplate[];
}

@ObjectType()
export class RabbitMQActionConfig extends StatusActionConfigBase {
  @Field(() => [String], { nullable: true })
  exchanges?: string[] | null;
}

export const StatusActionConfig = createUnionType({
  name: 'StatusActionConfig', // the name of the GraphQL union
  types: () => [EmailActionConfig, RabbitMQActionConfig], // function that returns array of object types classes
});

// NOTE: Default config starts here
@ObjectType()
export class EmailActionDefaultConfig extends StatusActionConfigBase {
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
export class RabbitMQActionDefaultConfig extends StatusActionConfigBase {
  constructor(exchanges: string[] | null) {
    super();
    this.exchanges = exchanges;
  }

  @Field(() => [String], { nullable: true })
  exchanges?: string[] | null;
}

export const StatusActionDefaultConfig = createUnionType({
  name: 'StatusActionDefaultConfig', // the name of the GraphQL union
  types: () => [EmailActionDefaultConfig, RabbitMQActionDefaultConfig], // function that returns array of object types classes
});
