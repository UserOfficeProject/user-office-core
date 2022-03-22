import { Link, Typography } from '@mui/material';
import React, { useState } from 'react';

import StyledModal from 'components/common/StyledModal';
import { SuperMaterialTable } from 'components/common/SuperMaterialTable';
import { createQuestionForm } from 'components/questionary/QuestionaryComponentRegistry';
import { useCreatableQuestions } from 'hooks/template/useCreatableQuestions';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AnswerCountDetails from './AnswerCountDetails';
import QuestionsTableFilter from './QuestionsTableFilter';
import TemplateCountDetails from './TemplateCountDetails';

const columns = [
  { title: 'Question', field: 'question' },
  { title: 'Key', field: 'naturalKey' },
  { title: 'Category', field: 'categoryId' },
  {
    title: '# Answers',
    field: 'answerCountButton',
    customSort: (a: QuestionWithUsage, b: QuestionWithUsage) =>
      a.answers.length - b.answers.length,
  },
  {
    title: '# Templates',
    field: 'templateCountButton',
    customSort: (a: QuestionWithUsage, b: QuestionWithUsage) =>
      a.templates.length - b.templates.length,
  },
];

function QuestionsPage() {
  const { questions, setQuestions, setQuestionsFilter, loadingQuestions } =
    useCreatableQuestions();

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
        onDeleted: (q) => {
          setQuestions(questions.filter((q2) => q2.id !== q.id));
        },
      });
    }
  };

  const deleteQuestion = async (questionId: string | number) =>
    api('Question deleted')
      .deleteQuestion({ questionId: questionId as string })
      .then((result) => result.deleteQuestion.rejection === null);

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

  const questionsWithButtons = questions.map((question) => ({
    ...question,
    answerCountButton: answerCountButton(question),
    templateCountButton: templateCountButton(question),
  }));

  return (
    <StyledContainer>
      <StyledPaper>
        <QuestionsTableFilter
          onChange={(filter) => {
            setQuestionsFilter(filter);
          }}
        />
        <div data-cy="questions-table">
          <SuperMaterialTable
            createModal={createModal}
            delete={deleteQuestion}
            setData={setQuestions}
            icons={tableIcons}
            title={
              <Typography variant="h6" component="h2">
                Questions
              </Typography>
            }
            columns={columns}
            isLoading={loadingQuestions}
            data={questionsWithButtons}
            options={{ search: false }}
            hasAccess={{ create: false, update: true, remove: true }}
          />
        </div>
      </StyledPaper>
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
    </StyledContainer>
  );
}

export default QuestionsPage;
