import SearchIcon from '@mui/icons-material/Search';
import { Button, Collapse, Grid, TextField, Autocomplete } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState, ReactElement } from 'react';

import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  Call,
  GetBlankQuestionaryStepsByCallIdQuery,
  InputMaybe,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
  QuestionTemplateRelation,
  QuestionTemplateRelationFragment,
} from 'generated/sdk';
import { useBlankQuestionaryStepsDataByCallId } from 'hooks/questionary/useBlankQuestionaryStepsDataByCallId';

import { useQuestionFilterQueryParams } from '../../../hooks/proposal/useQuestionFilterQueryParams';
import { SearchCriteriaInputProps } from '../../proposal/SearchCriteriaInputProps';
import UnknownSearchCriteriaInput from '../../questionary/questionaryComponents/UnknownSearchCriteriaInput';
import UOLoader from '../UOLoader';

export interface SearchCriteria {
  compareOperator: QuestionFilterCompareOperator;
  value: string | number | boolean | unknown[] | null;
}

interface QuestionaryFilterProps {
  templateId: number;
  callId?: InputMaybe<Call['id']>;
  onSubmit?: (questionFilter?: QuestionFilterInput) => void;
}

const getSearchCriteriaComponent = (
  questionTemplateRelation: QuestionTemplateRelationFragment | null
): ((props: SearchCriteriaInputProps) => ReactElement) => {
  if (!questionTemplateRelation) {
    return UnknownSearchCriteriaInput;
  }

  return (
    getQuestionaryComponentDefinition(
      questionTemplateRelation.question.dataType
    ).searchCriteriaComponent || UnknownSearchCriteriaInput
  );
};

const extractSearchableQuestions = (
  questionarySteps: GetBlankQuestionaryStepsByCallIdQuery['blankQuestionaryStepsByCallId']
) => {
  if (!questionarySteps) {
    return [];
  }

  return questionarySteps
    .reduce(
      (questions, step) => questions.concat(step.fields),
      new Array<QuestionTemplateRelation>()
    ) // create array of questions from template
    .filter(
      (question) =>
        getQuestionaryComponentDefinition(question.question.dataType)
          .searchCriteriaComponent !== undefined
    ); // only searchable questions
};

const useStyles = makeStyles((theme) => ({
  questionList: {
    flex: 1,
    marginBottom: theme.spacing(1),
  },
}));

function QuestionaryFilter({ onSubmit, callId }: QuestionaryFilterProps) {
  const { loading: isLoadingQuestionarySteps, questionarySteps } =
    useBlankQuestionaryStepsDataByCallId(callId);
  const classes = useStyles();

  const { questionFilterQuery, setQuestionFilterQuery } =
    useQuestionFilterQueryParams();

  const initialSearchCriteria =
    questionFilterQuery.compareOperator && questionFilterQuery.value
      ? {
          compareOperator:
            questionFilterQuery.compareOperator as QuestionFilterCompareOperator,
          value: questionFilterQuery.value,
        }
      : null;

  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionTemplateRelationFragment | null>(null);

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(
    initialSearchCriteria
  );

  useEffect(() => {
    if (questionFilterQuery.questionId) {
      const selectedQuestion = extractSearchableQuestions(
        questionarySteps
      ).find(
        (question) => question.question.id === questionFilterQuery.questionId
      );
      setSelectedQuestion(selectedQuestion ?? null);
    }
  }, [questionarySteps, setSelectedQuestion, questionFilterQuery.questionId]);

  const handleSubmit = (filter?: QuestionFilterInput) => {
    setQuestionFilterQuery(filter);
    onSubmit?.(filter);
  };

  if (isLoadingQuestionarySteps) {
    return <UOLoader />;
  }

  if (questionarySteps === null) {
    return <span>Failed to load template</span>;
  }

  const questions = extractSearchableQuestions(questionarySteps);

  const SearchCriteriaComponent = getSearchCriteriaComponent(selectedQuestion);

  return (
    <Grid container style={{ maxWidth: '400px', margin: '0 8px' }}>
      <Grid item xs={12}>
        <Autocomplete
          id={'question-list'}
          options={questions}
          getOptionLabel={(option) => option.question.question}
          isOptionEqualToValue={(option, value) =>
            option.question.id === value.question.id
          }
          renderInput={(params) => (
            <TextField {...params} margin="none" label="Question" />
          )}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.question.id}>
                {option.question.question}
              </li>
            );
          }}
          onChange={(_event, newValue) => {
            setSelectedQuestion(newValue);
            setSearchCriteria(null);
            if (!newValue) {
              handleSubmit(undefined); // submitting because it feels intuitive that filter is cleared if no question is selected
            }
          }}
          className={classes.questionList}
          value={selectedQuestion}
          data-cy="question-list"
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={!!selectedQuestion}>
          {selectedQuestion && (
            <SearchCriteriaComponent
              searchCriteria={searchCriteria}
              onChange={(compareOperator, value) => {
                setSearchCriteria({
                  compareOperator,
                  value,
                });
              }}
              questionTemplateRelation={selectedQuestion}
              callId={callId}
            />
          )}
        </Collapse>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'right' }}>
        {selectedQuestion && (
          <Button
            style={{ marginTop: '8px' }}
            startIcon={<SearchIcon />}
            onClick={() => {
              if (!selectedQuestion || !searchCriteria) {
                return;
              }
              handleSubmit({
                questionId: selectedQuestion.question.id,
                compareOperator: searchCriteria.compareOperator,
                value: searchCriteria.value,
                dataType: selectedQuestion.question.dataType,
              } as QuestionFilterInput);
            }}
            data-cy="search-btn"
          >
            Search
          </Button>
        )}
      </Grid>
    </Grid>
  );
}

export default QuestionaryFilter;
