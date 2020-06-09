import { Dialog, DialogContent, Link } from '@material-ui/core';
import { Archive, Delete, Edit, Email, FileCopy } from '@material-ui/icons';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { GetTemplatesQuery, Template } from '../../generated/sdk';
import { useCallsData } from '../../hooks/useCallsData';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';
import withConfirm, { WithConfirmType } from '../../utils/withConfirm';
import { CallsTable } from '../call/CallsTable';

type RowDataType = Pick<
  Template,
  | 'templateId'
  | 'name'
  | 'description'
  | 'isArchived'
  | 'proposalCount'
  | 'callCount'
>;

function CallsModal(props: { templateId?: number; onClose: () => void }) {
  const { loading, callsData } = useCallsData(undefined, props.templateId);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <Dialog
      open={props.templateId !== undefined}
      fullWidth={true}
      onClose={props.onClose}
    >
      <DialogContent>
        <CallsTable data={callsData} />
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
      setTemplates(data);
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
              .updateTemplate({
                templateId: (data as RowDataType).templateId,
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
                  response.updateTemplate.template!
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
              .updateTemplate({
                templateId: (data as RowDataType).templateId,
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
                  response.updateTemplate.template!
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
              .deleteTemplate({
                id: (data as RowDataType).templateId,
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
                .createTemplate({
                  name: data.name,
                  description: data.description,
                })
                .then(result => {
                  const { template, error } = result.createTemplate;

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
                    .cloneTemplate({
                      templateId: (data as RowDataType).templateId,
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
  dataProvider: () => Promise<Exclude<GetTemplatesQuery['templates'], null>>;
  confirm: WithConfirmType;
}

export default withConfirm(ProposalTemplatesTable);
