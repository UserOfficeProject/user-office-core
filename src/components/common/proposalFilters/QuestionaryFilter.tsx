import { Button, Collapse, Grid, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { FC, useState } from 'react';

import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  GetTemplateQuery,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
  QuestionFragment,
  QuestionTemplateRelation,
  QuestionTemplateRelationFragment,
} from 'generated/sdk';

import UnknownSearchCriteriaInput from '../../questionary/questionaryComponents/UnknownSearchCriteriaInput';
import UOLoader from '../UOLoader';

export interface SearchCriteriaInputProps {
  onChange: (
    comparator: QuestionFilterCompareOperator,
    value: string | number | boolean | never[]
  ) => any;
  question: QuestionFragment;
}

interface QuestionaryFilterProps {
  template: GetTemplateQuery['template'];
  isLoading: boolean;
  onSubmit?: (questionFilter?: QuestionFilterInput) => any;
}

const getSearchCriteriaComponent = (
  question: QuestionFragment | undefined
): FC<SearchCriteriaInputProps> => {
  if (!question) {
    return UnknownSearchCriteriaInput;
  }

  return (
    getQuestionaryComponentDefinition(question.dataType)
      .searchCriteriaComponent || UnknownSearchCriteriaInput
  );
};

function QuestionaryFilter({
  template,
  isLoading,
  onSubmit,
}: QuestionaryFilterProps) {
  const [
    selectedQuestion,
    setSelectedQuestion,
  ] = useState<QuestionTemplateRelationFragment | null>(null);

  const [searchCriteria, setSearchCriteria] = useState<{
    comparator: QuestionFilterCompareOperator;
    value: string;
  } | null>(null);

  if (isLoading) {
    return <UOLoader />;
  }

  if (template === null) {
    return <span>Failed to load template</span>;
  }

  const questions = template.steps
    .reduce(
      (questions, step) => questions.concat(step.fields),
      new Array<QuestionTemplateRelation>()
    ) // create array of questions from template
    .filter(
      question =>
        getQuestionaryComponentDefinition(question.question.dataType)
          .searchCriteriaComponent !== undefined
    ); // only searchable questions

  const SearchCriteriaComponent = getSearchCriteriaComponent(
    selectedQuestion?.question
  );

  return (
    <Grid container style={{ width: '400px', margin: '0 8px' }}>
      <Grid item xs={12}>
        <Autocomplete
          id="question"
          options={questions}
          getOptionLabel={option => option.question.question}
          renderInput={params => <TextField {...params} label="Question" />}
          onChange={(_event, newValue) => {
            setSelectedQuestion(newValue);
            if (!newValue) {
              onSubmit?.(undefined);
            }
          }}
          style={{ flex: 1, marginBottom: '8px' }}
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={!!selectedQuestion}>
          {selectedQuestion && (
            <SearchCriteriaComponent
              onChange={(comparator, value) => {
                setSearchCriteria({
                  comparator: comparator,
                  value: JSON.stringify({ value: value }),
                });
              }}
              question={selectedQuestion.question}
            />
          )}
        </Collapse>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'right' }}>
        {selectedQuestion && (
          <Button
            style={{ marginTop: '8px' }}
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            disabled={!selectedQuestion || !searchCriteria}
            onClick={() => {
              onSubmit?.({
                questionId: selectedQuestion.question.proposalQuestionId,
                compareOperator: searchCriteria!.comparator,
                value: searchCriteria!.value,
                dataType: selectedQuestion.question.dataType,
              });
            }}
          >
            Search
          </Button>
        )}
      </Grid>
    </Grid>
  );
}

export default QuestionaryFilter;
