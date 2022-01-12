// This is work in progress implementation for EAM service
import { logger } from '@user-office-software/duo-logger';
import axios from 'axios';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AnswerBasic } from '../../models/Questionary';
import {
  WEIGHT_QID,
  WIDTH_QID,
  HEIGHT_QID,
  LENGTH_QID,
} from '../../models/Shipment';
import { ProposalDataSource } from './../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from './../../datasources/QuestionaryDataSource';
import { ScheduledEventDataSource } from './../../datasources/ScheduledEventDataSource';
import { ShipmentDataSource } from './../../datasources/ShipmentDataSource';
import { UserDataSource } from './../../datasources/UserDataSource';
import { VisitDataSource } from './../../datasources/VisitDataSource';
import getAddAssetEquipmentReq from './requests/AddAssetEquipment';
import getCreateTicketReq from './requests/AddCaseManagement';

export interface AssetRegistrar {
  register(shipmentId: number): Promise<string>;
}

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_URL'
  | 'EAM_AUTH_SECRET'
  | 'EAM_AUTH_USER'
  | 'EAM_AUTH_PASS';

const getAnswerForNumberInput = (
  answerBasic: AnswerBasic
): number | undefined => answerBasic.answer?.value?.value;

@injectable()
export class EAMAssetRegistrar implements AssetRegistrar {
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource
  ) {}

  getEnvOrThrow(envVariable: EnvVars) {
    const value = process.env[envVariable];
    if (!value) {
      logger.logError(`Environmental variable ${envVariable} is not set`, {
        envVariable,
        value,
      });
      throw new Error(`Environmental variable ${envVariable} is not set`);
    }

    return value;
  }

  async performApiRequest(requestData: string) {
    const accessToken = await this.getToken();

    const response = await axios({
      method: 'post',
      url: `${this.getEnvOrThrow(
        'EAM_API_URL'
      )}/infor/CustomerApi/EAMWS/EAMTESTAPI/EWSConnector`,
      data: requestData,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': `${requestData.length}`,
        Authorization: `Bearer ${accessToken.token.access_token}`,
      },
    }).catch((error) => {
      const { message, response } = error;
      logger.logError('Error while calling EAM API', {
        message,
        requestData,
        responseData: response?.data,
      });
      throw new Error('Error while calling EAM API');
    });

    if (response.status !== 200) {
      logger.logError('Failed to execute registerAssetInEAM', { response });
      throw new Error('Failed to execute registerAssetInEAM');
    }

    return response.data as string;
  }

  private async createTicket(shipmentId: number, containerId: string) {
    const shipment = await this.shipmentDataSource.getShipment(shipmentId);
    if (!shipment) {
      logger.logError('Shipment not found', { shipmentId });
      throw new Error('Shipment not found');
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);
    if (!proposal) {
      logger.logError('Proposal for shipment not found', { shipment });
      throw new Error('Proposal not found');
    }

    // TODO: After shipment is attached to scheduled event,
    // we can skip getting the visit and get the scheduled event from the shipment
    // blocked by #SWAP-2065. For now, we need to get the visit from the shipment
    const visit = await this.visitDataSource.getVisit(shipment.visitId);
    if (!visit) {
      logger.logError('Visit for shipment not found', { shipment });
      throw new Error('Visit not found');
    }

    const scheduledEvent =
      await this.scheduledEventDataSource.getScheduledEvent(
        visit.scheduledEventId
      );
    if (!scheduledEvent) {
      logger.logError('Scheduled event for visit not found', { visit });
      throw new Error('Scheduled event not found');
    }

    let localContact = null;
    if (scheduledEvent.localContactId) {
      localContact = await this.userDataSource.getUser(
        scheduledEvent.localContactId
      );
    }

    const request = getCreateTicketReq(
      proposal.proposalId,
      proposal.title,
      containerId,
      scheduledEvent.startsAt,
      scheduledEvent.endsAt,
      scheduledEvent.startsAt,
      localContact?.email ?? 'not set'
    );

    await this.performApiRequest(request);
  }
  /**
   * Creates container in EAM
   * @returns newly created container ID
   */
  private async createContainer(shipmentId: number) {
    const shipment = await this.shipmentDataSource.getShipment(shipmentId);
    if (!shipment) {
      logger.logError('Shipment not found', { shipmentId });
      throw new Error('Shipment not found');
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);
    if (!proposal) {
      logger.logError('Proposal for shipment not found', { shipment });
      throw new Error('Proposal not found');
    }

    const weight = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      WEIGHT_QID
    );
    const width = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      WIDTH_QID
    );
    const height = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      HEIGHT_QID
    );
    const length = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      LENGTH_QID
    );

    if (!weight || !width || !height || !length) {
      logger.logError(
        'Can not create shipment because shipment template is not properly configured',
        { shipmentId, weight, width, height, length }
      );
      throw new Error('Could not create shipment');
    }

    const weightAnswer = getAnswerForNumberInput(weight);
    const widthAnswer = getAnswerForNumberInput(width);
    const heightAnswer = getAnswerForNumberInput(height);
    const lengthAnswer = getAnswerForNumberInput(length);

    if (!weightAnswer || !widthAnswer || !heightAnswer || !lengthAnswer) {
      logger.logError('Can not create shipment because answer is missing', {
        shipmentId,
        weight,
        width,
        height,
        length,
      });
      throw new Error('Could not create shipment');
    }

    const request = getAddAssetEquipmentReq(
      proposal.proposalId,
      proposal.title,
      weightAnswer,
      widthAnswer,
      heightAnswer,
      lengthAnswer
    );

    const response = await this.performApiRequest(request);

    const regexFindEquipmentCode =
      /<ns2:EQUIPMENTCODE>([0-9]*)<\/ns2:EQUIPMENTCODE>/;
    const result = response.match(regexFindEquipmentCode);

    if (!result || result.length < 2) {
      logger.logError('Unexpected response from EAM API', { response });
      throw new Error('Unexpected response from EAM API');
    }

    return result[1];
  }

  async register(shipmentId: number) {
    const containerId = await this.createContainer(shipmentId);
    await this.createTicket(shipmentId, containerId);

    return containerId;
  }

  async getToken() {
    const config: ModuleOptions = {
      client: {
        id: 'infor~pAVcElz8D8rmSWLPp9TmHDwLTOpOo2f3OW-2DDpW5xg',
        secret: this.getEnvOrThrow('EAM_AUTH_SECRET'),
      },
      auth: {
        tokenHost: this.getEnvOrThrow('EAM_AUTH_URL'),
        tokenPath: 'InforIntSTS/connect/token',
      },
    };
    const client = new ResourceOwnerPassword(config);

    const tokenParams = {
      username: this.getEnvOrThrow('EAM_AUTH_USER'),
      password: this.getEnvOrThrow('EAM_AUTH_PASS'),
      scope: 'offline_access',
    };

    try {
      return await client.getToken(tokenParams);
    } catch (error) {
      logger.logException('Access Token Error', error);
      throw new Error('Access Token Error');
    }
  }
}

export class SkipAssetRegistrar implements AssetRegistrar {
  async register(): Promise<string> {
    return '12345';
  }
}
