import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { InstrumentPickerConfig } from 'generated/sdk';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';

const InstrumentPickerAnswerRenderer: AnswerRenderer = ({ value, config }) => {
  // const instrumentIds = useMemo(
  //   () => (value ? toArray<number>(value) : null),
  //   [value]
  // );
  // const { instruments } = useInstrumentsByIdsData(instrumentIds);
  const ids = value.map((v: { instrumentId: string }) =>
    Number(v.instrumentId)
  );
  const { instruments } = useInstrumentsByIdsData(ids);
  const instrumentPickerConfig = config as InstrumentPickerConfig;
  {
    if (instrumentPickerConfig.requestTime) {
      const instrumentWithTime = instruments?.map((i) => {
        const filtered = value.find(
          (v: {
            instrumentId: string;
            instrumentName: string;
            timeRequested: number;
          }) => Number(v.instrumentId) === i.id
        );

        return i.name + ' (' + filtered.timeRequested + ') ';
      });

      return <span>{instrumentWithTime}</span>;
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
