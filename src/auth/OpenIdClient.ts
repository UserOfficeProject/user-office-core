import { logger } from '@user-office-software/duo-logger';
import { BaseClient, Issuer } from 'openid-client';

export class OpenIdClient {
  private static instance: BaseClient;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await this.createClient();
    }

    return this.instance;
  }

  private static async createClient() {
    const { clientId, clientSecret } = this.getConfig();

    const OpenIDIssuer = await this.getIssuer();

    return new OpenIDIssuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      response_types: ['code'],
    });
  }

  private static failCounter = 0;
  /**
   * Get the issuer from the discovery url
   * if it fails to get the issuer, then it will try to get the issuer again
   * after 2^n seconds, where n is the number of fails occurred so far
   * @returns {Promise<Issuer>}
   */
  private static async getIssuer(): Promise<Issuer<BaseClient>> {
    const { discoveryUrl } = this.getConfig();

    try {
      const issuer = await Issuer.discover(discoveryUrl);
      if (issuer) {
        this.failCounter = 0;
        logger.logInfo('OAuthIssuer discovery successful', {
          discoveryUrl,
        });

        return issuer;
      } else {
        logger.logError(
          'Unexpected behavior of Issuer. The returned client is null',
          {
            discoveryUrl,
          }
        );

        throw new Error('OAuthIssuer discovery failed');
      }
    } catch (error) {
      logger.logError('Error ocurred while obtaining OAuthIssuer', {
        error: (error as Error)?.message,
        numberOfFails: this.failCounter,
      });

      return new Promise((resolve) => {
        this.failCounter++;
        setTimeout(() => {
          resolve(this.getIssuer());
        }, 1000 * Math.pow(2, this.failCounter)); // repeat the request after 2^n seconds
      });
    }
  }

  public static getConfig() {
    const discoveryUrl = process.env.AUTH_DISCOVERY_URL;
    const clientId = process.env.AUTH_CLIENT_ID;
    const clientSecret = process.env.AUTH_CLIENT_SECRET;
    if (!discoveryUrl || !clientId || !clientSecret) {
      logger.logError('One or more ENV variables for OAUTH not defined', {
        discoveryUrl,
        clientId,
        clientSecret: clientSecret ? '******' : undefined,
      });
      throw new Error('One or more ENV variables for OAUTH not defined');
    }

    return {
      discoveryUrl,
      clientId,
      clientSecret,
    };
  }

  public static hasConfiguration() {
    try {
      const { discoveryUrl, clientId, clientSecret } = this.getConfig();

      return !!discoveryUrl && !!clientId && !!clientSecret;
    } catch (error) {
      return false;
    }
  }

  public static getScopes() {
    return ['openid', 'profile', 'email'];
  }
}
