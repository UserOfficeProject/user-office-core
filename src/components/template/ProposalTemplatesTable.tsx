import { Dialog, DialogContent, Link } from '@material-ui/core';
import { Archive, Delete, Edit, Email, FileCopy } from '@material-ui/icons';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import {
  GetProposalTemplatesQuery,
  ProposalTemplate,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';
import withConfirm, { WithConfirmType } from '../../utils/withConfirm';
import CallsTable from '../call/CallsTable';

type RowDataType = Pick<
  ProposalTemplate,
  | 'templateId'
  | 'name'
  | 'description'
  | 'isArchived'
  | 'proposalCount'
  | 'callCount'
>;

function CallsModal(props: { templateId?: number; onClose: () => void }) {
  return (
    <Dialog
      open={props.templateId !== undefined}
      fullWidth={true}
      onClose={props.onClose}
    >
      <DialogContent>
        <CallsTable templateId={props.templateId} />
      </DialogContent>
    </Dialog>
  );
}

function ProposalTemplatesTable(props: IProposalTemplatesTableProps) {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [templates, setTemplates] = useState<RowDataType[]>([]);
  const history = useHistory();

  useEffect(() => {
    props.dataProvider().then(data => {
      setTemplates(data.proposalTemplates);
    });
  }, [props]);
  const columns: Column<RowDataType>[] = [
    { title: 'Template ID', field: 'templateId', editable: 'never' },
    { title: 'Name', field: 'name', editable: 'always' },
    { title: 'Description', field: 'description', editable: 'always' },
    { title: '# proposals', field: 'proposalCount', editable: 'never' },
    {
      title: '# calls',
      field: 'callCount',
      editable: 'never',
      render: rowData => (
        <Link
          onClick={() => {
            setSelectedTemplateId(rowData.templateId);
          }}
          style={{ cursor: 'pointer' }}
        >
          {rowData.callCount}
        </Link>
      ),
    },
  ];

  const actionArray = [];
  actionArray.push({
    icon: () => <Email />,
    isFreeAction: true,
    tooltip: 'Edit template',
    onClick: (event: any, rowData: RowDataType) => {
      history.push(`/QuestionaryEditor/${rowData.templateId}`);
    },
  });

  const getUnarchiveButton = () => {
    return {
      icon: () => <UnarchiveIcon />,
      tooltip: 'Unarchive',
      onClick: (event: any, data: RowDataType | RowDataType[]) => {
        props.confirm(
          () => {
            api()
              .updateProposalTemplate({
                templateId: (data as RowDataType).templateId,
                isArchived: false,
              })
              .then(response => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    elem =>
                      elem.templateId ===
                      response.updateProposalTemplate.template?.templateId
                  ),
                  1,
                  response.updateProposalTemplate.template!
                );
                setTemplates(data);
              });
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to unarchive ${
              (data as RowDataType).name
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
      onClick: (event: any, data: RowDataType | RowDataType[]) => {
        props.confirm(
          () => {
            api()
              .updateProposalTemplate({
                templateId: (data as RowDataType).templateId,
                isArchived: true,
              })
              .then(response => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    elem =>
                      elem.templateId ===
                      response.updateProposalTemplate.template?.templateId
                  ),
                  1,
                  response.updateProposalTemplate.template!
                );
                setTemplates(data);
              });
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to archive ${
              (data as RowDataType).name
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
      onClick: (event: any, data: RowDataType | RowDataType[]) => {
        props.confirm(
          () => {
            api()
              .deleteProposalTemplate({
                id: (data as RowDataType).templateId,
              })
              .then(response => {
                const data = [...templates];
                data.splice(
                  templates.findIndex(
                    elem =>
                      elem.templateId ===
                      response.deleteProposalTemplate.template?.templateId
                  ),
                  1
                );
                setTemplates(data);
              });
          },
          {
            title: 'Are you sure?',
            description: `Are you sure you want to delete ${
              (data as RowDataType).name
            }`,
            confirmationText: 'Yes',
            cancellationText: 'Cancel',
          }
        )();
      },
    };
  };

  const getMaintenanceButton = (rowData: RowDataType) => {
    if (rowData.isArchived) {
      return getUnarchiveButton();
    } else {
      const isDeleteable =
        rowData.callCount === 0 && rowData.proposalCount === 0;
      if (isDeleteable) {
        return getDeleteButton();
      } else {
        return getArchiveButton();
      }
    }
  };

  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title="Proposal templates"
        columns={columns}
        data={templates}
        editable={{
          onRowAdd: data =>
            new Promise(resolve => {
              api()
                .createProposalTemplate({
                  name: data.name,
                  description: data.description,
                })
                .then(result => {
                  const { template, error } = result.createProposalTemplate;

                  if (!template) {
                    enqueueSnackbar(error || 'Error ocurred', {
                      variant: 'error',
                    });
                  } else {
                    const newTemplates = [...templates];
                    newTemplates.push(template!);
                    setTemplates(newTemplates);
                  }
                  resolve();
                });
            }),
        }}
        actions={[
          {
            icon: () => <Edit />,
            tooltip: 'Edit',
            onClick: (event: any, data: RowDataType | RowDataType[]) => {
              history.push(
                `/QuestionaryEditor/${(data as RowDataType).templateId}`
              );
            },
          },
          {
            icon: () => <FileCopy />,
            hidden: false,
            tooltip: 'Clone',
            onClick: (event: any, data: RowDataType | RowDataType[]) => {
              props.confirm(
                () => {
                  api()
                    .cloneProposalTemplate({
                      templateId: (data as RowDataType).templateId,
                    })
                    .then(result => {
                      const clonedTemplate =
                        result.cloneProposalTemplate.template;
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
                    (data as RowDataType).name
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
      <CallsModal
        templateId={selectedTemplateId}
        onClose={() => setSelectedTemplateId(undefined)}
      ></CallsModal>
    </>
  );
}

interface IProposalTemplatesTableProps {
  dataProvider: () => Promise<GetProposalTemplatesQuery>;
  confirm: WithConfirmType;
}

export default withConfirm(ProposalTemplatesTable);
