import { Button, Collapse, Grid, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { FC, useEffect, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import { getQuestionaryComponentDefinition } from 'components/questionary/QuestionaryComponentRegistry';
import {
  GetTemplateQuery,
  QuestionFilterCompareOperator,
  QuestionFilterInput,
  QuestionFragment,
  QuestionTemplateRelation,
  QuestionTemplateRelationFragment,
} from 'generated/sdk';
import { useTemplate } from 'hooks/template/useTemplate';

import UnknownSearchCriteriaInput from '../../questionary/questionaryComponents/UnknownSearchCriteriaInput';
import UOLoader from '../UOLoader';

export const useQuestionFilterQueryParams = () => {
  const [query, setQuery] = useQueryParams({
    questionId: StringParam,
    compareOperator: StringParam,
    value: StringParam,
    dataType: StringParam,
  });
  const setQuestionFilterQuery = (filter?: {
    questionId: string;
    compareOperator: string;
    value: string;
    dataType: string;
  }) => {
    setQuery({
      questionId: filter?.questionId,
      compareOperator: filter?.compareOperator,
      value: filter?.value,
      dataType: filter?.dataType,
    });
  };

  return { questionFilterQuery: query, setQuestionFilterQuery };
};

export interface SearchCriteriaInputProps {
  searchCriteria: SearchCriteria | null;
  onChange: (
    comparator: QuestionFilterCompareOperator,
    value: string | number | boolean | any[]
  ) => any;
  question: QuestionFragment;
}

interface SearchCriteria {
  compareOperator: QuestionFilterCompareOperator;
  value: string | number | boolean | any[];
}

interface QuestionaryFilterProps {
  templateId: number;
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

const extractSearchableQuestionsFromTemplate = (
  template: GetTemplateQuery['template']
) => {
  if (!template) {
    return [];
  }

  return template.steps
    .reduce(
      (questions, step) => questions.concat(step.fields),
      new Array<QuestionTemplateRelation>()
    ) // create array of questions from template
    .filter(
      question =>
        getQuestionaryComponentDefinition(question.question.dataType)
          .searchCriteriaComponent !== undefined
    ); // only searchable questions
};

function QuestionaryFilter({ templateId, onSubmit }: QuestionaryFilterProps) {
  const { template, isLoadingTemplate } = useTemplate(templateId);

  const {
    questionFilterQuery,
    setQuestionFilterQuery,
  } = useQuestionFilterQueryParams();

  const initialSearchCriteria =
    questionFilterQuery.compareOperator && questionFilterQuery.value
      ? {
          compareOperator: questionFilterQuery.compareOperator as QuestionFilterCompareOperator,
          value: questionFilterQuery.value,
        }
      : null;

  const [
    selectedQuestion,
    setSelectedQuestion,
  ] = useState<QuestionTemplateRelationFragment | null>(null);

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(
    initialSearchCriteria
  );

  useEffect(() => {
    if (questionFilterQuery.questionId) {
      const selectedQuestion = extractSearchableQuestionsFromTemplate(
        template
      ).find(
        question =>
          question.question.proposalQuestionId ===
          questionFilterQuery.questionId
      );
      setSelectedQuestion(selectedQuestion ?? null);
    }
  }, [template, setSelectedQuestion, questionFilterQuery.questionId]);

  const handleSubmit = (filter?: QuestionFilterInput) => {
    setQuestionFilterQuery(filter);
    onSubmit?.(filter);
  };

  if (isLoadingTemplate) {
    return <UOLoader />;
  }

  if (template === null) {
    return <span>Failed to load template</span>;
  }

  const questions = extractSearchableQuestionsFromTemplate(template);

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
              setSearchCriteria(null);
              handleSubmit(undefined); // submitting because it feels intuitive that filter is cleared if no question is selected
            }
          }}
          style={{ flex: 1, marginBottom: '8px' }}
          value={selectedQuestion}
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
              handleSubmit({
                questionId: selectedQuestion.question.proposalQuestionId,
                compareOperator: searchCriteria!.compareOperator,
                value: searchCriteria!.value as any,
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
