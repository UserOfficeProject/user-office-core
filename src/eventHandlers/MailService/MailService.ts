/* eslint-disable @typescript-eslint/camelcase */
import SparkPost from 'sparkpost';

import EmailSettings from './EmailSettings';

export default abstract class MailService {
  protected template_id: string;

  abstract sendMail(
    options: EmailSettings
  ):
    | Promise<void>
    | SparkPost.ResultsPromise<{
        total_rejected_recipients: number;
        total_accepted_recipients: number;
        id: string;
      }>;
}
