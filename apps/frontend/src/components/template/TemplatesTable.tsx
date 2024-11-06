import { Column, MaterialTableProps } from '@material-table/core';
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
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import MaterialTable from 'components/common/DenseMaterialTable';
import StyledDialog from 'components/common/StyledDialog';
import { GetTemplatesQuery, Template, TemplateGroupId } from 'generated/sdk';
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
  dataProvider: () => Promise<NonNullable<GetTemplatesQuery['templates']>>;
  isRowRemovable: (row: TemplateRowDataType) => boolean;
  actions?: MaterialTableProps<TemplateRowDataType>['actions'];
}

const TemplatesTable = ({
  dataProvider,
  columns,
  templateGroup,
  isRowRemovable,
  confirm,
  actions,
}: TemplatesTableProps & { confirm: WithConfirmType }) => {
  const [templates, setTemplates] = useState<TemplateRowDataType[]>([]);
  const { api } = useDataApiWithFeedback();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    dataProvider().then((data) => {
      data && setTemplates(data);
      setLoadingTemplates(false);
    });
  }, [dataProvider]);

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
              .then((response) => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    (elem) =>
                      elem.templateId === response.updateTemplate.templateId
                  ),
                  1
                );
                setTemplates(data);
              });
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
              .then((response) => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    (elem) =>
                      elem.templateId === response.updateTemplate.templateId
                  ),
                  1
                );
                setTemplates(data);
              });
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
              .then((response) => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    (elem) =>
                      elem.templateId === response.deleteTemplate.templateId
                  ),
                  1
                );
                setTemplates(data);
              });
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

  const editTemplate = (templateId: number) =>
    navigate(
      `/${templateGroup === TemplateGroupId.PDF_TEMPLATE ? 'PdfTemplateEditor' : 'QuestionaryEditor'}/${templateId}`
    );
  const customActions = actions || [];
  const EditIconComponent = () => <Edit />;
  const FileCopyIconComponent = () => <FileCopy />;

  const templatesWithId = templates.map((template) =>
    Object.assign(template, { id: template.templateId })
  );

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
                setTemplates([
                  ...templates,
                  { ...template, questionaryCount: 0 },
                ]);

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
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Templates
          </Typography>
        }
        columns={columns}
        isLoading={loadingTemplates}
        data={templatesWithId}
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
                      const clonedTemplate = result.cloneTemplate;
                      if (clonedTemplate) {
                        const newTemplates = [...templates];
                        newTemplates.push({ ...clonedTemplate, callCount: 0 });
                        setTemplates(newTemplates);
                      }
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
