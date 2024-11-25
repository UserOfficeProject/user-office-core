import MaterialTableCore, {
  Column,
  Query,
  QueryResult,
} from '@material-table/core';
import { Edit } from '@mui/icons-material';
import { DialogContent, Typography } from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import DenseMaterialTable from 'components/common/DenseMaterialTable';
import StyledDialog from 'components/common/StyledDialog';
import {
  createQuestionForm,
  nonCreatableQuestions,
} from 'components/questionary/QuestionaryComponentRegistry';
import {
  BasicUserDetailsFragment,
  DataType,
  QuestionsFilter,
  TemplateCategoryId,
} from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AnswerCountDetails from './AnswerCountDetails';
import QuestionsTableFilter from './QuestionsTableFilter';
import TemplateCountDetails from './TemplateCountDetails';

let columns: Column<QuestionWithUsage>[] = [
  { title: 'Question', field: 'question' },
  { title: 'Key', field: 'naturalKey' },
  { title: 'Category', field: 'categoryId' },
  {
    title: '# Answers',
    field: 'answers',
    render: (rowData: QuestionWithUsage) => (
      <ButtonWithDialog
        label={rowData.answers.length.toString()}
        title="Answers to the Question"
        data-cy="open-answer-details-btn"
      >
        <AnswerCountDetails question={rowData} />
      </ButtonWithDialog>
    ),
  },
  {
    title: '# Templates',
    field: 'templates',
    render: (rowData: QuestionWithUsage) => (
      <ButtonWithDialog
        label={rowData.templates.length.toString()}
        title="Templates using the question"
        data-cy="open-template-details-btn"
      >
        <TemplateCountDetails question={rowData} />
      </ButtonWithDialog>
    ),
  },
];

function QuestionsPage() {
  const [searchParams, setSearchParam] = useSearchParams();
  const category = searchParams.get('category') as TemplateCategoryId;

  const type = searchParams.get('type') as DataType;
  const [filter, setFilter] = React.useState<QuestionsFilter>({
    category: category ?? undefined,
    dataType: type ? [type] : undefined,
    excludeDataType: nonCreatableQuestions.map(
      (definition) => definition.dataType
    ),
  });
  const pageSize = searchParams.get('pageSize');
  const page = searchParams.get('page');
  const searchText = searchParams.get('search');

  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] =
    React.useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    React.useState<QuestionWithUsage>();
  const tableRef =
    React.createRef<MaterialTableCore<BasicUserDetailsFragment>>();

  const { api } = useDataApiWithFeedback();

  const fetchQuestionsData = (tableQuery: Query<QuestionWithUsage>) =>
    new Promise<QueryResult<QuestionWithUsage>>(async (resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;

        const results = await api().getAllQuestions({
          filter,
          searchText: tableQuery.search,
          sortField: orderBy?.orderByField,
          sortDirection: orderBy?.orderDirection,
          first: tableQuery.pageSize,
          offset: tableQuery.page * tableQuery.pageSize,
        });

        resolve({
          data: results.allQuestions?.questions,
          page: tableQuery.page,
          totalCount: results.allQuestions?.totalCount || 0,
        });
      } catch (error) {
        reject(error);
      }
    });

  columns = setSortDirectionOnSortField(
    columns,
    searchParams.get('sortField'),
    searchParams.get('sortDirection')
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper data-cy="questions-table">
        {/* Edit Form Modal */}
        <StyledDialog
          open={isEditQuestionModalOpen}
          title="Edit Question"
          maxWidth="md"
          onClose={() => setIsEditQuestionModalOpen(false)}
        >
          <DialogContent>
            {selectedQuestion && (
              <>
                {createQuestionForm({
                  question: selectedQuestion,
                  onUpdated: () => {
                    setIsEditQuestionModalOpen(false);
                    tableRef.current && tableRef.current.onQueryChange({});
                  },
                  onDeleted: () => {
                    setIsEditQuestionModalOpen(false);
                    tableRef.current && tableRef.current.onQueryChange({});
                  },
                  closeMe: () => {
                    setIsEditQuestionModalOpen(false);
                  },
                })}
              </>
            )}
          </DialogContent>
        </StyledDialog>

        {/* Filter Bar */}
        <QuestionsTableFilter
          onChange={(newFilter) => {
            setFilter((filter) => ({
              ...filter,
              category: newFilter.category,
              dataType: newFilter.dataType,
            }));

            tableRef.current && tableRef.current.onQueryChange({});
          }}
        />

        {/* Server Paginated Table */}
        <DenseMaterialTable
          tableRef={tableRef}
          title={
            <Typography variant="h6" component="h1">
              Questions
            </Typography>
          }
          editable={{
            onRowDelete: (oldData) => {
              return api({
                toastSuccessMessage: 'Question deleted',
              }).deleteQuestion({ questionId: oldData.id });
            },
            isDeletable: (rowData) => rowData.templates.length === 0,
          }}
          actions={[
            {
              icon: () => <Edit />,
              tooltip: 'Edit Question',
              onClick: (event, data) => {
                setIsEditQuestionModalOpen(true);
                setSelectedQuestion(Array.isArray(data) ? data[0] : data);
              },
            },
          ]}
          columns={columns}
          data={fetchQuestionsData}
          onSearchChange={(searchText) => {
            setSearchParam((searchParam) => {
              searchParam.delete('search');
              if (searchText) searchParam.set('search', searchText);

              return searchParam;
            });
          }}
          onOrderCollectionChange={(orderByCollection) => {
            const [orderBy] = orderByCollection;
            setSearchParam((searchParam) => {
              searchParam.delete('sortField');
              searchParam.delete('sortDirection');

              if (
                orderBy?.orderByField != null &&
                orderBy?.orderDirection != null
              ) {
                searchParam.set('sortField', orderBy?.orderByField);
                searchParam.set('sortDirection', orderBy?.orderDirection);
              }

              return searchParam;
            });
          }}
          onPageChange={(page, pageSize) => {
            setSearchParam((searchParam) => {
              searchParam.delete('page');
              searchParam.delete('pageSize');

              searchParam.set('page', page.toString());
              searchParam.set('pageSize', pageSize.toString());

              return searchParam;
            });
          }}
          options={{
            searchText: searchText ?? undefined,
            pageSize: pageSize ? +pageSize : undefined,
            initialPage: searchText ? 0 : page ? +page : 0,
            debounceInterval: 600,
          }}
        />
      </StyledPaper>
    </StyledContainer>
  );
}

export default QuestionsPage;
