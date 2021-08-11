import { GetVisitRegistrationQuery } from 'generated/sdk';
import { ExcludeNull } from 'utils/utilTypes';

export type RegistrationWithQuestionary = ExcludeNull<
  GetVisitRegistrationQuery['visitRegistration']
>;
