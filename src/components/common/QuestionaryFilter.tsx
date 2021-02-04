import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { FC, useState } from 'react';

import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  DataType,
  GetTemplateQuery,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
  QuestionFragment,
  QuestionTemplateRelation,
  QuestionTemplateRelationFragment,
} from 'generated/sdk';

import UOLoader from './UOLoader';

interface QuestionaryFilterProps {
  template: GetTemplateQuery['template'];
  isLoading: boolean;
  onSubmit?: (questionFilter: QuestionFilterInput) => any;
}

interface SearchCriteriaComponentProps {
  onChange: (
    comparator: QuestionFilterCompareOperator,
    value: string | number | boolean | never[]
  ) => any;
  question: QuestionFragment;
}

function TextSearchCriteriaComponent({
  onChange,
}: SearchCriteriaComponentProps) {
  const [value, setValue] = useState('');
  const [comparator, setComparator] = useState<QuestionFilterCompareOperator>(
    QuestionFilterCompareOperator.EQUALS
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <FormControl style={{ width: '100%' }}>
          <InputLabel shrink id="comparator">
            Compare operator
          </InputLabel>
          <Select
            onChange={event => {
              const newComparator = event.target
                .value as QuestionFilterCompareOperator;
              setComparator(newComparator);
              onChange(newComparator, value);
            }}
            value={comparator}
            labelId="comparator"
          >
            <MenuItem key="eq" value={QuestionFilterCompareOperator.EQUALS}>
              Equals
            </MenuItem>
            <MenuItem key="inc" value={QuestionFilterCompareOperator.INCLUDES}>
              Contains
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <TextField
          name="value"
          label="Value"
          value={value}
          fullWidth
          onChange={e => setValue(e.target.value)}
          onBlur={() => onChange(comparator, value)}
        />
      </Grid>
    </Grid>
  );
}

function UnknownSearchCriteriaComponent({
  question,
}: SearchCriteriaComponentProps) {
  return <span>{`Value input not implemented for ${question.dataType}`}</span>;
}

const getSearchCriteriaComponent = (
  question: QuestionFragment | undefined
): FC<SearchCriteriaComponentProps> => {
  if (!question) {
    return UnknownSearchCriteriaComponent;
  }
  switch (question.dataType) {
    case DataType.TEXT_INPUT:
      return TextSearchCriteriaComponent;
    default:
      return UnknownSearchCriteriaComponent;
  }
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
          .readonly === false
    ); // exclude readonly questions

  const SearchCriteriaComponent = getSearchCriteriaComponent(
    selectedQuestion?.question
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Autocomplete
          id="question"
          options={questions}
          getOptionLabel={option => option.question.question}
          renderInput={params => <TextField {...params} label="Question" />}
          onChange={(_event, newValue) => setSelectedQuestion(newValue)}
        />
      </Grid>
      <Grid item xs={5}>
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
      </Grid>
      <Grid item xs={3}>
        {selectedQuestion && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            disabled={!selectedQuestion || !searchCriteria}
            onClick={() =>
              onSubmit?.({
                questionId: selectedQuestion.question.proposalQuestionId,
                compareOperator: searchCriteria!.comparator,
                value: searchCriteria!.value,
                dataType: selectedQuestion.question.dataType,
              })
            }
          >
            Search
          </Button>
        )}
      </Grid>
    </Grid>
  );
}

export default QuestionaryFilter;
