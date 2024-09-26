# Configuration

_________________________________________________________________________________________________________

This page provides detailed instructions for configuring your environment. Proper configuration is essential for ensuring the project functions correctly. 

The configuration is managed through a `.env` file, which contains environment variables for various services and settings required by the application. The default configuration values are provided, but you can override these by setting the appropriate environment variables in your `.env` file. 

> **_NOTE:_** The `DEPENDENCY_CONFIG` variable is crucial for the User Office application. It enables, disables, or modifies various features based on the specified configuration. You can find the different configuration files in the `apps/backend/src/config` directory.

The `.env` file format is supported by the dotenv library, which loads these variables into the environment when the application starts. If a specific dependency configuration is not provided, the default configuration will be used. 

For more detailed information, refer to the [dotenv documentation](https://www.npmjs.com/package/dotenv).

_________________________________________________________________________________________________________

## Environment Variables

### EAM Configuration (ESS-specific)
The EAM (Enterprise Asset Management) section includes variables that configure API access and authentication.

- **EAM_API_URL**: Specifies the API URL for EAM services.
- **EAM_AUTH_CLIENT_ID**: The client ID for EAM authentication.
- **EAM_AUTH_CLIENT_SECRET**: The client secret for EAM authentication.
- **EAM_AUTH_HOST**: The authentication host for EAM.
- **EAM_AUTH_PASS**: The password for EAM authentication.
- **EAM_AUTH_USER**: The username for EAM authentication.
- **EAM_PART_CODE**: The part code used in EAM operations.

### Logging Configuration (Graylog)
To enable local logging via Graylog, uncomment and configure the following variables:

- **GRAYLOG_SERVER**: The address of the Graylog server.
- **GRAYLOG_PORT**: The port for the Graylog server.

### ORCID Configuration
The ORCID section can be used for integrating with the ORCID API for user identification and authentication.

- **ORCID_TOKEN_URL**: The URL for obtaining ORCID tokens.
- **ORCID_API_URL**: The ORCID API URL.
- **ORCID_CLIENT_ID**: The client ID for ORCID API access.
- **ORCID_CLIENT_SECRET**: The client secret for ORCID API access.

### User Office Factory Configuration
The User Office Factory configuration includes an endpoint for generating user office data.

- **USER_OFFICE_FACTORY_ENDPOINT**: The endpoint URL for the User Office Factory.

### OAuth Configuration
OAuth settings allow the application to authenticate users via an OAuth provider.

- **AUTH_DISCOVERY_URL**: The URL for OAuth discovery.
- **AUTH_CLIENT_ID**: The client ID for OAuth.
- **AUTH_CLIENT_SECRET**: The client secret for OAuth.

#### Example OAuth Configuration (Google)
To use Google OAuth, you can set the following:

```plaintext
AUTH_DISCOVERY_URL=https://accounts.google.com/.well-known/openid-configuration
AUTH_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
AUTH_CLIENT_SECRET=ABCDEF-0123456789
```

### General Application Settings
These settings cover the general configuration of the application environment.

- **NODE_ENV**: Specifies the environment (e.g., development, production).
- **DEPENDENCY_CONFIG**: Indicates which dependency configuration to use (`e2e`, `ess`, `stfc`, `test`). Defaults to the standard configuration if not provided.
- **DATABASE_URL**: The URL for the database connection.
- **BASE_URL**: The base URL for the application.
- **JWT_TOKEN_LIFE**: The lifetime of JWT tokens.
- **JWT_SECRET**: The secret key for JWT.
- **SPARKPOST_TOKEN**: The Sparkpost token for email services (if applicable).
- **TZ**: The timezone setting (e.g., Europe/Stockholm).
- **DATE_FORMAT**: The format for displaying dates.
- **DATE_TIME_FORMAT**: The format for displaying date and time.

### Initial User Configuration
This setting specifies the email address of the initial user officer:

- **INITIAL_USER_OFFICER_EMAIL**: The email address of the initial user officer.

### RabbitMQ Configuration
RabbitMQ is used for messaging and queueing. Uncomment and configure the following variables to enable RabbitMQ:

- **RABBITMQ_HOSTNAME**: The hostname for RabbitMQ.
- **RABBITMQ_USERNAME**: The username for RabbitMQ.
- **RABBITMQ_PASSWORD**: The password for RabbitMQ.
- **RABBITMQ_CORE_EXCHANGE_NAME**: The core exchange name for RabbitMQ.
- **RABBITMQ_SCHEDULER_EXCHANGE_NAME**: The scheduler exchange name for RabbitMQ.
- **RABBITMQ_EVENT_SCHEDULING_QUEUE_NAME**: The queue name for event scheduling in RabbitMQ.

### Scheduler Configuration
The scheduler endpoint is used for managing scheduled tasks:

- **SCHEDULER_ENDPOINT**: The endpoint URL for the scheduler.

### Email Configuration
The email configuration includes a sink email address for testing purposes:

- **SINK_EMAIL**: The email address to receive sink emails.

_________________________________________________________________________________________________________
