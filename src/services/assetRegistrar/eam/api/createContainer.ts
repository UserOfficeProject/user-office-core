import { container } from 'tsyringe';

import { Tokens } from '../../../../config/Tokens';
import { ProposalDataSource } from '../../../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../../../datasources/QuestionaryDataSource';
import { ShipmentDataSource } from '../../../../datasources/ShipmentDataSource';
import { TemplateDataSource } from '../../../../datasources/TemplateDataSource';
import {
  WEIGHT_KEY,
  WIDTH_KEY,
  HEIGHT_KEY,
  LENGTH_KEY,
  IS_DANGEROUS_GOODS_KEY,
  DANGEROUS_GOODS_UN_NUMBER_KEY,
  DANGEROUS_GOODS_DETAILS_KEY,
  SHIPMENT_SAMPLE_RISKS_KEY,
  PARCEL_VALUE_KEY,
  SHIPMENT_SENDER_COMPANY_KEY,
  SHIPMENT_SENDER_STREET_ADDRESS_KEY,
  SHIPMENT_SENDER_ZIP_CODE_KEY,
  SHIPMENT_SENDER_CITY_COUNTRY_KEY,
  SHIPMENT_SENDER_NAME_KEY,
  SHIPMENT_SENDER_EMAIL_KEY,
  SHIPMENT_SENDER_PHONE_KEY,
} from '../../../../models/Shipment';
import { DataType } from '../../../../models/Template';
import getRequest from '../requests/AddAssetEquipment';
import { createAndLogError } from '../utils/createAndLogError';
import { getEnvOrThrow } from '../utils/getEnvOrThrow';
import { performApiRequest } from '../utils/performApiRequest';
import { InstrumentDataSource } from './../../../../datasources/InstrumentDataSource';

async function getAnswer(
  questionaryId: number,
  questionKey: string,
  isOptional: boolean = false
) {
  const templateDataSource = container.resolve<TemplateDataSource>(
    Tokens.TemplateDataSource
  );

  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const question = await templateDataSource.getQuestionByNaturalKey(
    questionKey
  );
  if (!question) {
    throw createAndLogError(
      `Template is not properly configured. Question ${questionKey} not found`,
      {}
    );
  }

  const answerBasic = await questionaryDataSource.getAnswer(
    questionaryId,
    questionKey
  );
  if (!answerBasic && !isOptional) {
    throw createAndLogError(
      `Questionary missing required answer ${questionKey} for questionary ${questionaryId} not found`,
      {}
    );
  }

  switch (question.dataType) {
    case DataType.BOOLEAN:
      return answerBasic?.answer.value;
    case DataType.NUMBER_INPUT:
      return answerBasic?.answer.value.siValue;
    case DataType.TEXT_INPUT:
      return answerBasic?.answer.value;
    default:
      return undefined;
  }
}

/**
 * Creates container in EAM
 * @returns newly created container ID
 */
export async function createContainer(shipmentId: number) {
  const shipmentDataSource = container.resolve<ShipmentDataSource>(
    Tokens.ShipmentDataSource
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const partCode = getEnvOrThrow('EAM_PART_CODE');

  const shipment = await shipmentDataSource.getShipment(shipmentId);
  if (!shipment) {
    throw createAndLogError('Shipment for container not found', {
      shipmentId,
    });
  }

  const proposal = await proposalDataSource.get(shipment.proposalPk);
  if (!proposal) {
    throw createAndLogError('Proposal for container not found', {
      shipment,
    });
  }

  const qid = shipment.questionaryId;
  const weight = await getAnswer(qid, WEIGHT_KEY);
  const width = await getAnswer(qid, WIDTH_KEY);
  const height = await getAnswer(qid, HEIGHT_KEY);
  const length = await getAnswer(qid, LENGTH_KEY);
  const isDangerousGoods = await getAnswer(qid, IS_DANGEROUS_GOODS_KEY, true);
  const unNumber = await getAnswer(qid, DANGEROUS_GOODS_UN_NUMBER_KEY, true);
  const dangDetails = await getAnswer(qid, DANGEROUS_GOODS_DETAILS_KEY, true);
  const shipmentSampleRisks = await getAnswer(qid, SHIPMENT_SAMPLE_RISKS_KEY);
  const parcelValue = await getAnswer(qid, PARCEL_VALUE_KEY);
  const company = await getAnswer(qid, SHIPMENT_SENDER_COMPANY_KEY);
  const street = await getAnswer(qid, SHIPMENT_SENDER_STREET_ADDRESS_KEY);
  const zip = await getAnswer(qid, SHIPMENT_SENDER_ZIP_CODE_KEY);
  const countryCity = await getAnswer(qid, SHIPMENT_SENDER_CITY_COUNTRY_KEY);
  const senderName = await getAnswer(qid, SHIPMENT_SENDER_NAME_KEY);
  const senderEmail = await getAnswer(qid, SHIPMENT_SENDER_EMAIL_KEY);
  const senderPhone = await getAnswer(qid, SHIPMENT_SENDER_PHONE_KEY);
  const instrument = await instrumentDataSource.getInstrumentByProposalPk(
    proposal.primaryKey
  );

  const request = getRequest(
    partCode,
    proposal.proposalId,
    proposal.title,
    weight,
    width,
    height,
    length,
    isDangerousGoods ? 'true' : 'false',
    unNumber ?? 'No UN Number',
    dangDetails ?? 'No details',
    shipmentSampleRisks ?? 'No information',
    parcelValue ?? 'No value',
    company ?? 'No value',
    street ?? 'No value',
    zip ?? 'No value',
    countryCity ?? 'No value',
    senderName ?? 'No value',
    senderEmail ?? 'No value',
    senderPhone ?? 'No value',
    instrument?.shortCode ?? 'No value'
  );

  const response = await performApiRequest(request);

  const regexFindEquipmentCode =
    /<ns2:EQUIPMENTCODE>([0-9]*)<\/ns2:EQUIPMENTCODE>/;
  const result = response.match(regexFindEquipmentCode);

  if (!result || result.length < 2) {
    throw createAndLogError('Unexpected response from EAM API', {
      response,
    });
  }

  return result[1];
}
