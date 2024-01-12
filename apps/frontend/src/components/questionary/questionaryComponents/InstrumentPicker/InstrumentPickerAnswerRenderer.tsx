import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { useInstrumentsByIdsData } from 'hooks/instrument/useInstrumentsByIdsData';

const InstrumentPickerAnswerRenderer: AnswerRenderer = ({ value }) => {
  const { instruments } = useInstrumentsByIdsData(value);

  return (
    <span>
      {instruments?.length
        ? instruments.map((instrument) => instrument.name).join(', ')
        : 'NA'}
    </span>
  );
};

export default InstrumentPickerAnswerRenderer;
