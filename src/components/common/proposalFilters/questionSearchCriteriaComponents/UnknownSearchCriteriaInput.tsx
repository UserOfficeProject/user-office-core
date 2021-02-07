import React from 'react';
import { SearchCriteriaInputProps } from '../QuestionaryFilter';

function UnknownSearchCriteriaInput({ question }: SearchCriteriaInputProps) {
  return <span>{`Search input not implemented for ${question.dataType}`}</span>;
}

export default UnknownSearchCriteriaInput;
