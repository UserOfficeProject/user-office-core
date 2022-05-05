import { Typography } from '@mui/material';
import React from 'react';

import { SuperMaterialTable } from 'components/common/SuperMaterialTable';
import { createQuestionForm } from 'components/questionary/QuestionaryComponentRegistry';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
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
    render: (rowData: QuestionWithUsage) => (
      <ButtonWithDialog
        label={rowData.answers.length.toString()}
        data-cy="open-answer-details-btn"
      >
        <AnswerCountDetails question={rowData} />
      </ButtonWithDialog>
    ),
  },
  {
    title: '# Templates',
    field: 'templateCountButton',
    customSort: (a: QuestionWithUsage, b: QuestionWithUsage) =>
      a.templates.length - b.templates.length,
    render: (rowData: QuestionWithUsage) => (
      <ButtonWithDialog
        label={rowData.templates.length.toString()}
        data-cy="open-template-details-btn"
      >
        <TemplateCountDetails question={rowData} />
      </ButtonWithDialog>
    ),
  },
];

function QuestionsPage() {
  const { questions, setQuestions, setQuestionsFilter, loadingQuestions } =
    useCreatableQuestions();

  const { api } = useDataApiWithFeedback();

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
        closeMe: () => {
          onUpdate(null);
        },
      });
    }
  };

  const deleteQuestion = async (questionId: string | number) => {
    const { deleteQuestion } = await api({
      toastSuccessMessage: 'Question deleted',
    }).deleteQuestion({ questionId: questionId as string });

    return deleteQuestion.rejection === null;
  };

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
            data={questions}
            options={{ search: false }}
            hasAccess={{ create: false, update: true, remove: true }}
          />
        </div>
      </StyledPaper>
    </StyledContainer>
  );
}

export default QuestionsPage;
