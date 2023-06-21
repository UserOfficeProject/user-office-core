import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../../datasources/QuestionaryDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { DataType } from '../../models/Template';
import { UserWithRole } from '../../models/User';
import InstrumentMutations from '../../mutations/InstrumentMutations';

export default function createHandler() {
  const questionaryDataSource = container.resolve<QuestionaryDataSource>(
    Tokens.QuestionaryDataSource
  );

  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const instrumentMutations = container.resolve(InstrumentMutations);

  return async function (event: ApplicationEvent) {
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      case Event.TOPIC_ANSWERED:
        {
          const questionaryId = event.questionarystep.questionaryId;

          const instrumentPickerAnswer =
            await questionaryDataSource.getLatestAnswerByQuestionaryIdAndDataType(
              questionaryId,
              DataType.INSTRUMENT_PICKER
            );

          if (!instrumentPickerAnswer) break;
          const instrumentId = instrumentPickerAnswer?.answer.answer.value;
          if (!instrumentId)
            throw new Error(`Invalid Instrument id ${instrumentId}`);

          const instrument = await instrumentDataSource.getInstrument(
            instrumentId
          );
          if (!instrument)
            throw new Error(`Instrument with id ${instrumentId} not found`);
          const proposal = await proposalDataSource.getByQuestionaryId(
            questionaryId
          );
          if (!proposal)
            throw new Error(
              `Proposal with questionary id ${questionaryId} not found`
            );
          await instrumentMutations.assignProposalsToInstrumentHelper(
            { id: 0 } as UserWithRole,
            {
              proposals: [
                {
                  primaryKey: proposal.primaryKey,
                  callId: proposal.callId,
                },
              ],
              instrumentId,
            }
          );
        }

        break;
      default:
        break;
    }
  };
}
