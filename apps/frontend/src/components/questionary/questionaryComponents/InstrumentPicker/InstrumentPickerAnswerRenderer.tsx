import React from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { useInstrumentData } from 'hooks/instrument/useInstrumentData';

const InstrumentPickerAnswerRenderer: AnswerRenderer = ({ value }) => {
  const { instrument } = useInstrumentData(value);

  return <span>{instrument?.name || 'NA'}</span>;
};

export default InstrumentPickerAnswerRenderer;
