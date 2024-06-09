import React, { useMemo } from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { InstrumentPickerConfig } from 'generated/sdk';
import { useQuestionCallData } from 'hooks/call/useQuestionCallData';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import { toArray } from 'utils/helperFunctions';

const InstrumentPickerAnswerRenderer: AnswerRenderer = ({
  value,
  config,
  question,
}) => {
  const ids = useMemo(
    () =>
      Array.isArray(value)
        ? value.map((v: { instrumentId: string }) => Number(v.instrumentId))
        : toArray<number>(Number(value.instrumentId)),
    [value]
  );
  const { instruments } = useInstrumentsByIdsData(ids);
  const data = useQuestionCallData(question.id);
  const instrumentPickerConfig = config as InstrumentPickerConfig;
  {
    if (instrumentPickerConfig.requestTime) {
      const instrumentWithTime = instruments?.map((i) => {
        const filtered = Array.isArray(value)
          ? value.find(
              (v: {
                instrumentId: string;
                instrumentName: string;
                timeRequested: number;
              }) => Number(v.instrumentId) === i.id
            )
          : value;

        return (
          i.name +
          ' (' +
          filtered.timeRequested +
          ' ' +
          data.call?.allocationTimeUnit +
          ') '
        );
      });

      return <span>{instrumentWithTime?.join(', ')}</span>;
    } else {
      return (
        <span>
          {instruments?.length
            ? instruments.map((instrument) => instrument.name).join(', ')
            : 'NA'}
        </span>
      );
    }
  }
};

export default InstrumentPickerAnswerRenderer;
