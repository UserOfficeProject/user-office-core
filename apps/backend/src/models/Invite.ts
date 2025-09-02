import { EmailTemplateId } from '../eventHandlers/email/emailTemplateId';

export class Invite {
  constructor(
    public id: number,
    public code: string,
    public email: string,
    public createdAt: Date,
    public createdByUserId: number,
    public claimedAt: Date | null,
    public claimedByUserId: number | null,
    public isEmailSent: boolean,
    public expiresAt: Date | null,
    public templateId: EmailTemplateId | null
  ) {}
}
