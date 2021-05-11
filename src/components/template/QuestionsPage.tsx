import { Grid, Link } from '@material-ui/core';
import React, { useState } from 'react';

import StyledModal from 'components/common/StyledModal';
import { SuperMaterialTable } from 'components/common/SuperMaterialTable';
import { createQuestionForm } from 'components/questionary/QuestionaryComponentRegistry';
import { useCreatableQuestions } from 'hooks/template/useCreatableQuestions';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AnswerCountDetails from './AnswerCountDetails';
import QuestionsTableFilter from './QuestionsTableFilter';
import TemplateCountDetails from './TemplateCountDetails';

function QuestionsPage() {
  const {
    questions,
    setQuestions,
    setQuestionsFilter,
    loadingQuestions,
  } = useCreatableQuestions();

  const { api } = useDataApiWithFeedback();

  const [
    selectedTemplateCountDetailsQuestion,
    setSelectedTemplateCountDetailsQuestion,
  ] = useState<QuestionWithUsage | null>(null);

  const [
    selectedAnswerCountDetailsQuestion,
    setSelectedAnswerCountDetailsQuestion,
  ] = useState<QuestionWithUsage | null>(null);

  const createModal = (
    onUpdate: FunctionType<void, [QuestionWithUsage | null]>,
    onCreate: FunctionType<void, [QuestionWithUsage | null]>,
    question: QuestionWithUsage | null
  ) => {
    if (question) {
      return createQuestionForm({
        question,
        onUpdated: (q) => onUpdate(q as QuestionWithUsage),
      });
    }
  };

  const templateCountButton = (rowData: QuestionWithUsage) => (
    <Link
      onClick={() => setSelectedTemplateCountDetailsQuestion(rowData)}
      style={{ cursor: 'pointer' }}
    >
      {rowData.templates.length}
    </Link>
  );

  const answerCountButton = (rowData: QuestionWithUsage) => (
    <Link
      onClick={() => setSelectedAnswerCountDetailsQuestion(rowData)}
      style={{ cursor: 'pointer' }}
    >
      {rowData.answers.length}
    </Link>
  );

  const columns = [
    { title: 'Question', field: 'question' },
    { title: 'Key', field: 'naturalKey' },
    { title: 'Category', field: 'categoryId' },
    {
      title: '# Answers',
      render: answerCountButton,
      customSort: (a: QuestionWithUsage, b: QuestionWithUsage) =>
        a.answers.length - b.answers.length,
    },
    {
      title: '# Templates',
      render: templateCountButton,
      customSort: (a: QuestionWithUsage, b: QuestionWithUsage) =>
        a.templates.length - b.templates.length,
    },
  ];

  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <QuestionsTableFilter
              onChange={(filter) => {
                setQuestionsFilter(filter);
              }}
            />
            <SuperMaterialTable
              createModal={createModal}
              delete={(questionId) =>
                api('Question deleted')
                  .deleteQuestion({ questionId: questionId as string })
                  .then((result) => result.deleteQuestion === null)
              }
              setData={setQuestions}
              icons={tableIcons}
              title="Questions"
              columns={columns}
              isLoading={loadingQuestions}
              data={questions}
              options={{ search: false }}
              hasAccess={{ create: false, update: true, remove: true }}
            />
          </StyledPaper>
        </Grid>
      </Grid>
      <StyledModal
        onClose={() => setSelectedTemplateCountDetailsQuestion(null)}
        open={selectedTemplateCountDetailsQuestion !== null}
      >
        <TemplateCountDetails question={selectedTemplateCountDetailsQuestion} />
      </StyledModal>
      <StyledModal
        onClose={() => setSelectedAnswerCountDetailsQuestion(null)}
        open={selectedAnswerCountDetailsQuestion !== null}
      >
        <AnswerCountDetails question={selectedAnswerCountDetailsQuestion} />
      </StyledModal>
    </ContentContainer>
  );
}

export default QuestionsPage;
