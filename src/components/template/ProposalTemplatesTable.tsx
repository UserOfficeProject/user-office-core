import { Delete, Edit, Email, FileCopy } from '@material-ui/icons';
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

function ProposalTemplatesTable(props: IProposalTemplatesTableProps) {
  type RowDataType = Pick<
    ProposalTemplate,
    | 'templateId'
    | 'name'
    | 'description'
    | 'isArchived'
    | 'proposalCount'
    | 'callCount'
  >;
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
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
    { title: '# calls', field: 'callCount', editable: 'never' },
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

  return (
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
        rowData => ({
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
        }),
      ]}
    />
  );
}

interface IProposalTemplatesTableProps {
  dataProvider: () => Promise<GetProposalTemplatesQuery>;
  confirm: WithConfirmType;
}

export default withConfirm(ProposalTemplatesTable);
