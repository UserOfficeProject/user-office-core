import { GetUserExperimentsQuery } from 'generated/sdk';

export type VisitRegistrationCore = NonNullable<
  NonNullable<
    NonNullable<NonNullable<GetUserExperimentsQuery['me']>['experiments']>[0]
  >['visit']
>['registrations'][0];
