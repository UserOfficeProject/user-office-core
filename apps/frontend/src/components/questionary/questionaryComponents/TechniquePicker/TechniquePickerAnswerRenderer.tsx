import React, { useMemo } from 'react';

import { AnswerRenderer } from 'components/questionary/QuestionaryComponentRegistry';
import { useTechniquesByIdsData } from 'hooks/technique/useTechniquesByIdsData';
import { toArray } from 'utils/helperFunctions';

const TechniquePickerAnswerRenderer: AnswerRenderer = ({ value }) => {
  const techniqueIds = useMemo(
    () => (value ? toArray<number>(value) : null),
    [value]
  );
  const { techniques } = useTechniquesByIdsData(techniqueIds);

  return (
    <span>
      {techniques?.length
        ? techniques.map((technique) => technique.name).join(', ')
        : 'NA'}
    </span>
  );
};

export default TechniquePickerAnswerRenderer;
