import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { ExperimentDataSource } from '../../datasources/ExperimentDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../../datasources/TemplateDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { getTopicActiveAnswers } from '../../models/ProposalModelFunctions';
import { Answer, QuestionaryStep } from '../../models/Questionary';
import { DataType } from '../../models/Template';
import { UserWithRole } from '../../models/User';

export type ShipmentPDFData = {
  shipment: {
    id: number;
    title: string;
    externalRef: string;
    proposalId?: string;
    callShortCode?: string;
    instrumentShortCodes?: string;
    localContact?: string;
  };
  answers: Record<string, string>;
  pdfTemplate: string | null;
};

const isPrintableValue = (value: unknown): value is string | number =>
  (typeof value === 'string' && value.trim() !== '') ||
  (typeof value === 'number' && Number.isFinite(value));

function formatAnswer({ value, question }: Answer): string | undefined {
  switch (question.dataType) {
    case DataType.BOOLEAN:
      return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : undefined;
    case DataType.NUMBER_INPUT:
      if (!isPrintableValue(value?.value)) {
        return undefined;
      }

      return [value.value, value.unit?.symbol]
        .filter(isPrintableValue)
        .join(' ');
    case DataType.DATE:
    case DataType.TEXT_INPUT:
    case DataType.RICH_TEXT_INPUT:
      return isPrintableValue(value) ? String(value) : undefined;
    case DataType.SELECTION_FROM_OPTIONS:
    case DataType.DYNAMIC_MULTIPLE_CHOICE:
      return Array.isArray(value)
        ? value.filter(isPrintableValue).join(', ') || undefined
        : undefined;
    default:
      return undefined;
  }
}

export function collectShipmentLabelAnswers(steps: QuestionaryStep[]) {
  return Object.fromEntries(
    steps.flatMap(({ fields }) =>
      fields.flatMap((field) => {
        const answer = formatAnswer(field);

        return answer === undefined
          ? []
          : [[field.question.naturalKey, answer]];
      })
    )
  ) as Record<string, string>;
}

export async function collectShipmentPDFData(
  shipmentId: number,
  user: UserWithRole,
  notify?: (filename: string) => void
): Promise<ShipmentPDFData> {
  const shipment = await baseContext.queries.shipment.getShipment(
    user,
    shipmentId
  );
  if (!shipment) {
    throw new Error(
      `Shipment with ID '${shipmentId}' not found, or the user has insufficient rights`
    );
  }

  notify?.(`shipment_${shipment.id}.pdf`);

  const questionaryDB = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );
  const [questionary, steps, experiment, proposal, instruments] =
    await Promise.all([
      questionaryDB.getQuestionary(shipment.questionaryId),
      questionaryDB.getQuestionarySteps(shipment.questionaryId),
      container
        .resolve<ExperimentDataSource>(Tokens.ExperimentDataSource)
        .getExperiment(shipment.experimentPk),
      container
        .resolve<ProposalDataSource>(Tokens.ProposalDataSource)
        .get(shipment.proposalPk),
      container
        .resolve<InstrumentDataSource>(Tokens.InstrumentDataSource)
        .getInstrumentsByProposalPk(shipment.proposalPk),
    ]);

  const localContactId = experiment?.localContactId;
  const [template, call, localContact] = await Promise.all([
    questionary
      ? container
          .resolve<TemplateDataSource>(Tokens.TemplateDataSource)
          .getTemplate(questionary.templateId)
      : null,
    proposal
      ? container
          .resolve<CallDataSource>(Tokens.CallDataSource)
          .getCall(proposal.callId)
      : null,
    localContactId == null
      ? null
      : container
          .resolve<UserDataSource>(Tokens.UserDataSource)
          .getUser(localContactId),
  ]);
  const printableSteps =
    baseContext.queries.questionary.filterQuestionaryForReadPermissions(
      user,
      steps
        .filter(({ topic }) => topic.isEnabled)
        .map((step) => ({
          ...step,
          fields: getTopicActiveAnswers(steps, step.topic.id),
        }))
    );

  return {
    shipment: {
      id: shipment.id,
      title: shipment.title,
      externalRef: shipment.externalRef,
      proposalId: proposal?.proposalId,
      callShortCode: call?.shortCode,
      instrumentShortCodes: instruments
        ?.map(({ shortCode }) => shortCode)
        .join(', '),
      localContact: localContact
        ? `${localContact.preferredname} ${localContact.lastname}`
        : undefined,
    },
    answers: collectShipmentLabelAnswers(printableSteps),
    pdfTemplate: template?.shipmentLabelTemplate ?? null,
  };
}
