import React, { useMemo } from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';
import { toArray } from 'utils/helperFunctions';

const InstrumentPickerAnswerRenderer: AnswerRenderer = ({ value }) => {
  const instrumentIds = useMemo(
    () => (value ? toArray<number>(value) : null),
    [value]
  );
  const { instruments } = useInstrumentsByIdsData(instrumentIds);

  return (
    <span>
      {instruments?.length
        ? instruments.map((instrument) => instrument.name).join(', ')
        : 'NA'}
    </span>
  );
};

export default InstrumentPickerAnswerRenderer;
