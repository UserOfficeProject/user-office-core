import MaterialTableCore, {
  Column,
  MaterialTableProps,
  Query,
  QueryResult,
} from '@material-table/core';
import Archive from '@mui/icons-material/Archive';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import FileCopy from '@mui/icons-material/FileCopy';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PublishIcon from '@mui/icons-material/Publish';
import ShareIcon from '@mui/icons-material/Share';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { DialogContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import MaterialTable from 'components/common/DenseMaterialTable';
import StyledDialog from 'components/common/StyledDialog';
import {
  PaginationSortDirection,
  Template,
  TemplateGroupId,
} from 'generated/sdk';
import { downloadBlob } from 'utils/downloadBlob';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import CreateTemplate from './CreateTemplate';

export type TemplateRowDataType = Pick<
  Template,
  'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
> &
  Record<string, unknown>;

export interface TemplatesTableProps {
  columns: Column<TemplateRowDataType>[];
  templateGroup: TemplateGroupId;
  isArchived: boolean;
  isRowRemovable: (row: TemplateRowDataType) => boolean;
  actions?: MaterialTableProps<TemplateRowDataType>['actions'];
  emptyDataSourceMessage?: React.ReactNode;
}

const TemplatesTable = ({
  isArchived,
  columns,
  templateGroup,
  isRowRemovable,
  confirm,
  actions,
  emptyDataSourceMessage,
}: TemplatesTableProps & { confirm: WithConfirmType }) => {
  const tableRef = useRef<MaterialTableCore<TemplateRowDataType>>(null);
  const { api } = useDataApiWithFeedback();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const sortDirection = searchParams.get('sortDirection');
  const sortField = searchParams.get('sortField');
  const sortedColumns = columns.map((column) => ({
    ...column,
    defaultSort:
      column.field === sortField &&
      (sortDirection === PaginationSortDirection.ASC ||
        sortDirection === PaginationSortDirection.DESC)
        ? sortDirection
        : undefined,
  }));
  const search = searchParams.get('search') || '';
  const requestedPage = Number(searchParams.get('page'));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage >= 0
      ? requestedPage
      : 0;
  const requestedPageSize = Number(searchParams.get('pageSize'));
  const pageSize =
    Number.isSafeInteger(requestedPageSize) && requestedPageSize > 0
      ? requestedPageSize
      : 10;
  const fetchTemplates = useCallback(
    async (
      query: Query<TemplateRowDataType>
    ): Promise<QueryResult<TemplateRowDataType>> => {
      const [orderBy] = query.orderByCollection;
      const fetchPage = (page: number) =>
        api().getTemplatesPage({
          group: templateGroup,
          isArchived,
          first: query.pageSize,
          offset: page * query.pageSize,
          searchText: query.search,
          sortField: orderBy?.orderByField,
          sortDirection:
            orderBy?.orderDirection === PaginationSortDirection.ASC
              ? PaginationSortDirection.ASC
              : orderBy?.orderDirection === PaginationSortDirection.DESC
                ? PaginationSortDirection.DESC
                : undefined,
        });
      let { templatesPage } = await fetchPage(query.page);
      if (!templatesPage) {
        throw new Error('Unable to load templates');
      }
      const page = Math.min(
        query.page,
        Math.max(0, Math.ceil(templatesPage.totalCount / query.pageSize) - 1)
      );
      if (page !== query.page) {
        ({ templatesPage } = await fetchPage(page));
        if (!templatesPage) {
          throw new Error('Unable to load templates');
        }
        setSearchParams(
          (params) => {
            params.set('page', String(page));

            return params;
          },
          { replace: true }
        );
      }

      return {
        data: templatesPage.templates.map((template) => ({
          ...template,
          id: template.templateId,
        })),
        page,
        totalCount: templatesPage.totalCount,
      };
    },
    [api, isArchived, templateGroup, setSearchParams]
  );
  const refreshTemplates = () => tableRef.current?.onQueryChange({});

  const UnarchiveIconComponent = () => <UnarchiveIcon />;
  const getUnarchiveButton = () => {
    return {
      icon: UnarchiveIconComponent,
      tooltip: 'Unarchive',
      onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        data: TemplateRowDataType | TemplateRowDataType[]
      ) => {
        confirm(
          () => {
            api()
              .updateTemplate({
                templateId: (data as TemplateRowDataType).templateId,
                isArchived: false,
              })
              .then(refreshTemplates);
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to unarchive ${
              (data as TemplateRowDataType).name
            }. This action can be undone by archiving the template.`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const ArchiveIconComponent = () => <Archive />;
  const getArchiveButton = () => {
    return {
      icon: ArchiveIconComponent,
      tooltip: 'Archive',
      onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        data: TemplateRowDataType | TemplateRowDataType[]
      ) => {
        confirm(
          () => {
            api({ toastSuccessMessage: 'Template archived successfully' })
              .updateTemplate({
                templateId: (data as TemplateRowDataType).templateId,
                isArchived: true,
              })
              .then(refreshTemplates);
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to archive ${
              (data as TemplateRowDataType).name
            }. This action can be undone by unarchiving the template.`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const DeleteIconComponent = () => <Delete data-cy="delete-template" />;
  const getDeleteButton = (rowData: TemplateRowDataType) => {
    return {
      icon: DeleteIconComponent,
      hidden: !isRowRemovable(rowData),
      tooltip: 'Delete',
      onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        data: TemplateRowDataType | TemplateRowDataType[]
      ) => {
        confirm(
          () => {
            api()
              .deleteTemplate({
                id: (data as TemplateRowDataType).templateId,
              })
              .then(refreshTemplates);
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to delete ${
              (data as TemplateRowDataType).name
            }. This action cannot be undone.`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const getArchivedOrUnarchivedButton = (rowData: TemplateRowDataType) => {
    if (rowData.isArchived) {
      return getUnarchiveButton();
    }

    return getArchiveButton();
  };
  const editTemplate = (templateId: number) => {
    if (templateGroup === TemplateGroupId.PROPOSAL_PDF)
      navigate(`/PdfTemplateEditor/proposal/${templateId}`);
    else if (templateGroup === TemplateGroupId.EXPERIMENT_SAFETY_PDF)
      navigate(`/PdfTemplateEditor/experimentSafety/${templateId}`);
    else navigate(`/QuestionaryEditor/${templateId}`);
  };

  const customActions = actions || [];
  const EditIconComponent = () => <Edit />;
  const FileCopyIconComponent = () => <FileCopy />;

  return (
    <>
      <StyledDialog
        open={show}
        onClose={() => setShow(false)}
        title="Create New Template"
      >
        <DialogContent dividers>
          <CreateTemplate
            onComplete={(template) => {
              if (template) {
                setTimeout(() => {
                  editTemplate(template.templateId);
                });
              }
              setShow(false);
            }}
            groupId={templateGroup}
          />
        </DialogContent>
      </StyledDialog>
      <MaterialTable
        key={JSON.stringify([search, page, pageSize, sortField, sortDirection])}
        tableRef={tableRef}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Templates
          </Typography>
        }
        columns={sortedColumns}
        data={fetchTemplates}
        onSearchChange={(search) => {
          setSearchParams((params) => {
            params.delete('search');
            if (search) params.set('search', search);
            params.set('page', '0');

            return params;
          });
        }}
        onPageChange={(page, pageSize) => {
          setSearchParams((params) => {
            params.set('page', String(page));
            params.set('pageSize', String(pageSize));

            return params;
          });
        }}
        onOrderCollectionChange={([orderBy]) => {
          setSearchParams((params) => {
            params.delete('sortField');
            params.delete('sortDirection');
            if (orderBy?.orderByField && orderBy.orderDirection) {
              params.set('sortField', orderBy.orderByField);
              params.set('sortDirection', orderBy.orderDirection);
            }
            params.set('page', '0');

            return params;
          });
        }}
        options={{
          searchText: search,
          initialPage: page,
          pageSize,
          debounceInterval: 600,
        }}
        // text to show when the table is empty
        localization={{
          body: {
            emptyDataSourceMessage:
              emptyDataSourceMessage ?? 'No templates found',
          },
        }}
        actions={[
          ...customActions,
          {
            icon: EditIconComponent,
            tooltip: 'Edit',
            onClick: (event, data) => {
              editTemplate((data as TemplateRowDataType).templateId);
            },
          },
          {
            icon: FileCopyIconComponent,
            hidden: false,
            tooltip: 'Clone',
            onClick: (event, data) => {
              confirm(
                () => {
                  api()
                    .cloneTemplate({
                      templateId: (data as TemplateRowDataType).templateId,
                    })
                    .then((result) => {
                      if (result.cloneTemplate) refreshTemplates();
                    });
                },
                {
                  title: 'Are you sure?',
                  description: `Are you sure you want to clone ${
                    (data as TemplateRowDataType).name
                  }`,
                  confirmationText: 'Yes',
                  cancellationText: 'Cancel',
                }
              )();
            },
          },
          {
            icon: ShareIcon,
            tooltip: 'Export',
            onClick: (event, data) => {
              api()
                .getTemplateExport({
                  templateId: (data as TemplateRowDataType).templateId,
                })
                .then((result) => {
                  if (!result.template) {
                    return;
                  }

                  const blob = new Blob([result.template.json], {
                    type: 'application/json;charset=utf8',
                  });
                  downloadBlob(
                    blob,
                    `${(data as TemplateRowDataType).name}.json`
                  );
                });
            },
          },
          (rowData) => getDeleteButton(rowData),
          (rowData) => getArchivedOrUnarchivedButton(rowData),
        ]}
      />
      <ActionButtonContainer>
        <Button
          startIcon={<PublishIcon />}
          type="button"
          onClick={() => {
            navigate('/ImportTemplate');
          }}
          data-cy="import-template-button"
        >
          Import
        </Button>
        <Button
          startIcon={<PostAddIcon />}
          type="button"
          onClick={() => setShow(true)}
          data-cy="create-new-button"
        >
          Create
        </Button>
      </ActionButtonContainer>
    </>
  );
};

export default withConfirm(TemplatesTable);
