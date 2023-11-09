import { GetVisitRegistrationQuery } from 'generated/sdk';

export type RegistrationWithQuestionary = NonNullable<
  GetVisitRegistrationQuery['visitRegistration']
>;
