import React from 'react';

import { SearchCriteriaInputProps } from '../../proposal/SearchCriteriaInputProps';

function UnknownSearchCriteriaInput({
  questionTemplateRelation,
}: SearchCriteriaInputProps) {
  return (
    <span>{`Search input not implemented for ${questionTemplateRelation.question.dataType}`}</span>
  );
}

export default UnknownSearchCriteriaInput;
