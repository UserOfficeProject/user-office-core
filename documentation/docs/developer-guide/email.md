This guide will help you set up email services in your project using either SMTP or SparkPost. 

## Overview
Email services are essential for sending notifications, alerts, and other communications from your application. In this project, we have two main implementations:

- **SMTPMailService**: Uses SMTP protocol.
- **SparkPostMailService**: Uses SparkPost API.

## Setting Up SMTP

If using SMTP, please refer to the `SMTPMailService` class here:

`backend\src\eventHandlers\MailService\SMTPMailService.ts`

### Methods

- **getEmailTemplatePath**: Constructs the path to the email template.
- **getSmtpAuthOptions**: Retrieves SMTP authentication options from environment variables.
- **sendMail**: Sends an email using `nodemailer`.
- **getEmailTemplates**: Fetches email templates (implementation needed).

### Environment Variables

Ensure the following environment variables are set:

- `EMAIL_AUTH_USERNAME`
- `EMAIL_AUTH_PASSWORD`

## Setting Up SparkPost

If using SparkPost, please refer to the `SparkPostMailService.ts` class here:

`backend\src\eventHandlers\MailService\SparkPostMailService.ts`


### Methods

- **getEnvOptions**: Adjusts email options based on the environment.
- **sendMail**: Sends an email using SparkPost API.
- **getEmailTemplates**: Fetches email templates from SparkPost.

### Environment Variables

Ensure the following environment variables are set:

- `SPARKPOST_TOKEN`
- `SINK_EMAIL` (optional, for non-production environments)

## SMTP vs SparkPost

### SMTP
**Pros**:

  - Direct control over email sending.
  - No dependency on third-party services.

**Cons**:

  - Requires managing SMTP server.
  - Potentially more complex setup.

### SparkPost
**Pros**:

  - Simplified email sending via API.
  - Advanced features like analytics and templates.

**Cons**:

  - Dependency on third-party service.
  - Requires API token and configuration.

Now you should be able to set up and configure email services effectively. Choose the service that best fits your needs and environment.
