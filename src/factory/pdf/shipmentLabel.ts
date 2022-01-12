import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { Shipment } from '../../models/Shipment';
import { DataType, Question } from '../../models/Template';
import { UserWithRole } from '../../models/User';
import { CallDataSource } from './../../datasources/CallDataSource';
import { InstrumentDataSource } from './../../datasources/InstrumentDataSource';
import { TemplateDataSource } from './../../datasources/TemplateDataSource';
import { AnswerBasic } from './../../models/Questionary';
import {
  HEIGHT_QID,
  LENGTH_QID,
  WEIGHT_QID,
  WIDTH_QID,
  STORAGE_TEMPERATURE_QID,
  IS_FRAGILE_QID,
  LOCAL_CONTACT_QID,
  IS_DANGEROUS_QID,
} from './../../models/Shipment';

export type ShipmentPDFData = {
  shipment: Shipment & {
    proposalId: string;
    callShortCode: string;
    instrumentShortCode: string;
    weight: number;
    width: number;
    height: number;
    length: number;
    storageTemperature: string;
    isFragile: boolean;
    localContact: string;
    isDangerous: boolean;
  };
};

const formatAnswer = ({ answer }: AnswerBasic, question: Question) => {
  switch (question.dataType) {
    case DataType.BOOLEAN:
      return answer.value === true ? 'Yes' : 'No';
    case DataType.NUMBER_INPUT:
      const value = answer.value.value;
      const unit = answer.value.unit;

      return `${value} ${unit ? unit : ''}`;
    case DataType.SELECTION_FROM_OPTIONS:
      return answer.value.join(', ');
    default:
      return answer.value;
  }
};

const getAnswer = async (questionaryId: number, naturalKey: string) => {
  const questionaryDB = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const templateDB = container.resolve<TemplateDataSource>(
    Tokens.TemplateDataSource
  );

  const question = await templateDB.getQuestionByNaturalKey(naturalKey);
  if (question === null) {
    throw new Error(`Question not found for naturalKey: ${naturalKey}`);
  }

  const answer = await questionaryDB.getAnswer(questionaryId, naturalKey);
  if (answer === null) {
    throw new Error(
      `Answer not found for questionaryId: ${questionaryId}, naturalKey: ${naturalKey}`
    );
  }

  return formatAnswer(answer, question);
};

const getQuestionaryData = async (questionaryId: number) => {
  const weight = await getAnswer(questionaryId, WEIGHT_QID);
  const width = await getAnswer(questionaryId, WIDTH_QID);
  const height = await getAnswer(questionaryId, HEIGHT_QID);
  const length = await getAnswer(questionaryId, LENGTH_QID);
  const storageTemperature = await getAnswer(
    questionaryId,
    STORAGE_TEMPERATURE_QID
  );
  const isFragile = await getAnswer(questionaryId, IS_FRAGILE_QID);
  const localContact = await getAnswer(questionaryId, LOCAL_CONTACT_QID);
  const isDangerous = await getAnswer(questionaryId, IS_DANGEROUS_QID);

  return {
    weight,
    width,
    height,
    length,
    storageTemperature,
    isFragile,
    localContact,
    isDangerous,
  };
};

const getProposalData = async (proposalPk: number) => {
  const dataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const proposal = await dataSource.get(proposalPk);
  if (proposal === null) {
    throw new Error(`Proposal not found for proposalPk: ${proposalPk}`);
  }

  return {
    proposalId: proposal.proposalId,
    proposalPk: proposal.primaryKey,
    callId: proposal.callId,
  };
};

const getCallData = async (callId: number) => {
  const calDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );
  const call = await calDataSource.getCall(callId);
  if (!call) {
    throw new Error('Call not found');
  }

  return {
    callShortCode: call.shortCode,
  };
};

const getInstrumentData = async (proposalPk: number) => {
  const dataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const instrumnet = await dataSource.getInstrumentByProposalPk(proposalPk);
  if (!instrumnet) {
    throw new Error(`Instrument not found for proposalPk: ${proposalPk}`);
  }

  return {
    instrumentShortCode: instrumnet.shortCode,
  };
};

export async function collectShipmentPDFData(
  shipmentId: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ShipmentPDFData> {
  const shipment = await baseContext.queries.shipment.getShipment(
    user,
    shipmentId
  );
  if (!shipment) {
    throw new Error(
      `shipment with ID '${shipmentId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`shipment_${shipment.id}.pdf`);

  const proposal = await getProposalData(shipment.proposalPk);
  const questionaryData = await getQuestionaryData(shipment.questionaryId);
  const callData = await getCallData(proposal.callId);
  const instrumentdata = await getInstrumentData(proposal.proposalPk);

  const out = {
    shipment: {
      ...shipment,
      ...proposal,
      ...questionaryData,
      ...callData,
      ...instrumentdata,
    },
  };

  return out;
}
