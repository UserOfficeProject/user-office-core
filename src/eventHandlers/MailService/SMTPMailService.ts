/* eslint-disable @typescript-eslint/camelcase */
import * as path from 'path';

import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults } from './MailService';

export class SMTPMailService extends MailService {
  private _email: EmailTemplates<any>;

  constructor() {
    super();
    this.template_id = path.resolve('src', 'eventHandlers', 'emails', 'submit');

    this._email = new EmailTemplates({
      message: {
        from: process.env.EMAIL_SENDER || 'user.office@stfc.ac.uk',
      },
      send: true,
      transport: nodemailer.createTransport({
        host: process.env.EMAIL_AUTH_HOST || 'exchsmtp.stfc.ac.uk',
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        ...(process.env.EMAIL_AUTH_USERNAME && process.env.EMAIL_AUTH_PASSWORD
          ? {
              auth: {
                user: process.env.EMAIL_AUTH_USERNAME,
                pass: process.env.EMAIL_AUTH_PASSWORD,
              },
            }
          : {}),
      }),
    });
  }

  sendMail(
    options: EmailSettings
  ): Promise<{
    results: SendMailResults;
  }> {
    const emailPromises: Promise<SendMailResults>[] = [];

    const sendMailResults: SendMailResults = {
      total_rejected_recipients: 0,
      total_accepted_recipients: 0,
      id: Math.random()
        .toString(36)
        .substring(7),
    };

    if (process.env.NODE_ENV !== 'production') {
      sendMailResults.id = 'test';
    }

    options.content.template_id = this.template_id;

    options.recipients.forEach(participant => {
      emailPromises.push(
        this._email.send({
          template: options.content.template_id,
          message: {
            ...(typeof participant.address !== 'string'
              ? {
                  to: {
                    address: participant.address.email,
                    name: participant.address.header_to,
                  },
                }
              : {
                  to: participant.address,
                }),
          },
          locals: options.substitution_data,
        })
      );
    });

    return Promise.allSettled(emailPromises).then(results => {
      results.forEach(result => {
        if (result.status === 'rejected') {
          sendMailResults.total_rejected_recipients++;
        } else {
          sendMailResults.total_accepted_recipients++;
        }
      });

      return sendMailResults.total_rejected_recipients > 0
        ? Promise.reject({ results: sendMailResults })
        : Promise.resolve({ results: sendMailResults });
    });
  }
}
