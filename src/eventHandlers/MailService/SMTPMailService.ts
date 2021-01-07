/* eslint-disable @typescript-eslint/camelcase */
import * as path from 'path';

import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';
import SparkPost from 'sparkpost';

import { logger } from '../../utils/Logger';
import EmailSettings from './EmailSettings';
import MailService from './MailService';

export class SMTPMailService extends MailService {
  private _email: EmailTemplates<any>;

  constructor() {
    super();
    this.template_id = path.resolve('src', 'eventHandlers', 'emails', 'submit');

    this._email = new EmailTemplates({
      message: {
        from: 'user.office@stfc.ac.uk',
      },
      send: true,
      transport: nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: '4e566b2f85570d',
          pass: '8db2bccf645b15',
        },
      }),
    });
  }

  sendMail(
    options: EmailSettings
  ):
    | Promise<void>
    | SparkPost.ResultsPromise<{
        total_rejected_recipients: number;
        total_accepted_recipients: number;
        id: string;
      }> {
    options.content.template_id = this.template_id;

    // Resolve promise if all emails are successfully sent
    return new Promise<void>(
      (resolve: (msg: any) => void, reject: (err: Error) => void) => {
        options.recipients.forEach((participant, index) => {
          this._email
            .send({
              template: options.content.template_id,
              message: {
                to: participant.address.email,
              },
              locals: options.substitution_data,
            })
            .then(() => {
              if (index === options.recipients.length - 1)
                resolve('Emails sent');
            })
            .catch((err: Error) => {
              reject(err);
              logger.logError(
                `Failed to send email to ${participant.address.email}`,
                {
                  error: err,
                }
              );
            });
        });
      }
    );
  }
}
