import { SendMailResults } from '../MailService';
import { SparkPostTemplate } from './SparkPostMailService';
import { CreateTransmission } from './SparkPostSettings';

const defaults = {
  endpoint: 'https://api.sparkpost.com:443',
  apiVersion: 'v1',
};

export class SparkPost {
  private apiKey: string;
  private endpoint: string;
  private apiVersion: string;

  constructor(
    apiKey: string,
    options: {
      origin?: string | undefined;
      endpoint?: string | undefined;
      apiVersion?: string | undefined;
      headers?: Record<string, unknown>;
    }
  ) {
    this.apiKey = apiKey;
    this.endpoint = options.endpoint || defaults.endpoint;
    this.apiVersion = options.apiVersion || defaults.apiVersion;
  }

  async request<TResponse>(
    apiPath: string,
    config: RequestInit
  ): Promise<{ results: TResponse }> {
    const url = `${this.endpoint}/api/${this.apiVersion}${apiPath}`;

    config.headers = { ...config.headers, Authorization: this.apiKey };

    const response = await fetch(url, config);

    if (!response.ok) {
      return response.text().then((text) => {
        throw new Error(
          `An error occurred while sending the request to SparkPost: ${text}`
        );
      });
    }

    return await response.json();
  }

  async send(transmission: CreateTransmission) {
    const sendEmailApi = '/transmissions';

    const options = { method: 'POST', body: JSON.stringify(transmission) };

    const response = await this.request<SendMailResults>(sendEmailApi, options);

    return response;
  }

  async getTemplates(includeDraft: boolean) {
    const getTemplatesApi = `/templates?draft=${includeDraft}`;

    const options = { method: 'GET' };

    const response = await this.request<SparkPostTemplate[]>(
      getTemplatesApi,
      options
    );

    return response;
  }
}
