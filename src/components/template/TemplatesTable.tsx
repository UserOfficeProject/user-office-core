import Button from '@material-ui/core/Button';
import Archive from '@material-ui/icons/Archive';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import FileCopy from '@material-ui/icons/FileCopy';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import MaterialTable, { Column } from 'material-table';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import {
  GetTemplatesQuery,
  Template,
  TemplateCategoryId,
  TemplateMetadataFragment,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';
import { WithConfirmType } from 'utils/withConfirm';

import CreateTemplate from './CreateTemplate';
import { ProposalTemplateRowDataType } from './ProposalTemplatesTable';

export type TemplateRowDataType = Pick<
  Template,
  'templateId' | 'name' | 'description' | 'isArchived'
>;

interface TemplatesTableProps {
  columns: Column<ProposalTemplateRowDataType>[];
  templateCategory: TemplateCategoryId;
  dataProvider: () => Promise<Exclude<GetTemplatesQuery['templates'], null>>;
  isRowRemovable: (row: TemplateRowDataType) => boolean;
  confirm: WithConfirmType;
}
export function TemplatesTable(props: TemplatesTableProps) {
  const [templates, setTemplates] = useState<TemplateRowDataType[]>([]);
  const api = useDataApi();
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    props.dataProvider().then(data => {
      data && setTemplates(data);
      setLoadingTemplates(false);
    });
  }, [props]);

  const getUnarchiveButton = () => {
    return {
      icon: () => <UnarchiveIcon />,
      tooltip: 'Unarchive',
      onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        data: TemplateRowDataType | TemplateRowDataType[]
      ) => {
        props.confirm(
          () => {
            api()
              .updateTemplate({
                templateId: (data as TemplateRowDataType).templateId,
                isArchived: false,
              })
              .then(response => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    elem =>
                      elem.templateId ===
                      response.updateTemplate.template?.templateId
                  ),
                  1,
                  response.updateTemplate.template as TemplateMetadataFragment
                );
                setTemplates(data);
              });
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to unarchive ${
              (data as TemplateRowDataType).name
            }`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const getArchiveButton = () => {
    return {
      icon: () => <Archive />,
      tooltip: 'Archive',
      onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        data: TemplateRowDataType | TemplateRowDataType[]
      ) => {
        props.confirm(
          () => {
            api()
              .updateTemplate({
                templateId: (data as TemplateRowDataType).templateId,
                isArchived: true,
              })
              .then(response => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    elem =>
                      elem.templateId ===
                      response.updateTemplate.template?.templateId
                  ),
                  1,
                  response.updateTemplate.template as TemplateMetadataFragment
                );
                setTemplates(data);
              });
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to archive ${
              (data as TemplateRowDataType).name
            }`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const getDeleteButton = () => {
    return {
      icon: () => <Delete />,
      tooltip: 'Delete',
      onClick: (
        event: React.MouseEvent<HTMLButtonElement>,
        data: TemplateRowDataType | TemplateRowDataType[]
      ) => {
        props.confirm(
          () => {
            api()
              .deleteTemplate({
                id: (data as TemplateRowDataType).templateId,
              })
              .then(response => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    elem =>
                      elem.templateId ===
                      response.deleteTemplate.template?.templateId
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
            }`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const getMaintenanceButton = (rowData: TemplateRowDataType) => {
    if (rowData.isArchived) {
      return getUnarchiveButton();
    } else {
      const isRemovable = props.isRowRemovable(rowData);
      if (isRemovable) {
        return getDeleteButton();
      } else {
        return getArchiveButton();
      }
    }
  };

  const editTemplate = (templateId: number) => {
    history.push(`/QuestionaryEditor/${templateId}`);
  };

  return (
    <>
      <InputDialog open={show} onClose={() => setShow(false)}>
        <CreateTemplate
          onComplete={template => {
            if (template) {
              setTemplates([...templates, template]);

              setTimeout(() => {
                editTemplate(template.templateId);
              });
            }
            setShow(false);
          }}
          categoryId={props.templateCategory}
        />
      </InputDialog>
      <MaterialTable
        icons={tableIcons}
        title="Proposal templates"
        columns={props.columns}
        isLoading={loadingTemplates}
        data={templates}
        actions={[
          {
            icon: () => <Edit />,
            tooltip: 'Edit',
            onClick: (event, data) => {
              editTemplate((data as TemplateRowDataType).templateId);
            },
          },
          {
            icon: () => <FileCopy />,
            hidden: false,
            tooltip: 'Clone',
            onClick: (event, data) => {
              props.confirm(
                () => {
                  api()
                    .cloneTemplate({
                      templateId: (data as TemplateRowDataType).templateId,
                    })
                    .then(result => {
                      const clonedTemplate = result.cloneTemplate.template;
                      if (clonedTemplate) {
                        const newTemplates = [...templates];
                        newTemplates.push(clonedTemplate);
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
          rowData => getMaintenanceButton(rowData),
        ]}
      />
      <ActionButtonContainer>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => setShow(true)}
          data-cy="create-new-button"
        >
          Create template
        </Button>
      </ActionButtonContainer>
    </>
  );
}
