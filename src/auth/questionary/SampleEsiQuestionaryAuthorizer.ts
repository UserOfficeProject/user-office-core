import { injectable } from 'tsyringe';

import { UserWithRole } from '../../models/User';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';

@injectable()
export class SampleEsiQuestionaryAuthorizer implements QuestionaryAuthorizer {
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    //  TODO implement this
    return true;
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    //  TODO implement this
    return true;
  }
}
