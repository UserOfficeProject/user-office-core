import { Delete, Edit, Email, FileCopy } from '@material-ui/icons';
import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import {
  GetProposalTemplatesMetadataQuery,
  ProposalTemplateMetadata,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';
import withConfirm, { WithConfirmType } from '../../utils/withConfirm';

function ProposalTemplatesTable(props: IProposalTemplatesTableProps) {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [templates, setTemplates] = useState<ProposalTemplateMetadata[]>([]);
  const history = useHistory();
  useEffect(() => {
    props.dataProvider().then(data => {
      setTemplates(data.proposalTemplatesMetadata);
    });
  }, [props]);
  const columns: Column<ProposalTemplateMetadata>[] = [
    { title: 'Template ID', field: 'templateId', editable: 'never' },
    { title: 'Name', field: 'name', editable: 'always' },
    { title: 'Description', field: 'description', editable: 'always' },
  ];

  const actionArray = [];
  actionArray.push({
    icon: () => <Email />,
    isFreeAction: true,
    tooltip: 'Edit template',
    onClick: (event: any, rowData: ProposalTemplateMetadata) => {
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
                const {
                  templateMetadata,
                  error,
                } = result.createProposalTemplate;

                if (!templateMetadata) {
                  enqueueSnackbar(error || 'Error ocurred', {
                    variant: 'error',
                  });
                } else {
                  const newTemplates = [...templates];
                  newTemplates.push(templateMetadata!);
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
          onClick: (
            event: any,
            data: ProposalTemplateMetadata | ProposalTemplateMetadata[]
          ) => {
            history.push(
              `/QuestionaryEditor/${
                (data as ProposalTemplateMetadata).templateId
              }`
            );
          },
        },
        {
          icon: () => <FileCopy />,
          hidden: false,
          tooltip: 'Clone',
          onClick: (
            event: any,
            data: ProposalTemplateMetadata | ProposalTemplateMetadata[]
          ) => {
            props.confirm(
              () => {
                console.log('Confirmed');
              },
              {
                title: 'Are you sure?',
                description: `Are you sure you want to clone ${
                  (data as ProposalTemplateMetadata).name
                }`,
              }
            )();
          },
        },
        rowData => ({
          icon: () => <Delete />,
          tooltip: 'Delete',
          onClick: (
            event: any,
            data: ProposalTemplateMetadata | ProposalTemplateMetadata[]
          ) => {
            props.confirm(
              () => {
                api()
                  .deleteProposalTemplate({
                    id: (data as ProposalTemplateMetadata).templateId,
                  })
                  .then(response => {
                    const data = [...templates];
                    data.splice(
                      templates.findIndex(
                        elem =>
                          elem.templateId ===
                          response.deleteProposalTemplate.templateMetadata
                            ?.templateId
                      ),
                      1
                    );
                    setTemplates(data);
                  });
              },
              {
                title: 'Are you sure?',
                description: `Are you sure you want to delete ${
                  (data as ProposalTemplateMetadata).name
                }`,
              }
            )();
          },
        }),
      ]}
    />
  );
}

interface IProposalTemplatesTableProps {
  dataProvider: () => Promise<GetProposalTemplatesMetadataQuery>;
  confirm: WithConfirmType;
}

export default withConfirm(ProposalTemplatesTable);
