import { Column } from 'material-table';
import React from 'react';

import { ProposalTemplate, TemplateCategoryId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

type SampleTemplateRowDataType = TemplateRowDataType & {};

function SampleTemplatesTable(props: SampleTemplatesTableProps) {
  const columns: Column<SampleTemplateRowDataType>[] = [
    { title: 'Template ID', field: 'templateId', editable: 'never' },
    { title: 'Name', field: 'name', editable: 'always' },
    { title: 'Description', field: 'description', editable: 'always' },
    { title: '# samples', field: 'proposalCount', editable: 'never' },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateCategory={TemplateCategoryId.SAMPLE_DECLARATION}
        isRowDeleteable={rowData => {
          return true;
        }}
        dataProvider={props.dataProvider}
        confirm={props.confirm}
      />
    </>
  );
}

interface SampleTemplatesTableProps {
  dataProvider: () => Promise<
    Pick<
      ProposalTemplate,
      'templateId' | 'name' | 'description' | 'isArchived'
    >[]
  >;
  confirm: WithConfirmType;
}

export default withConfirm(SampleTemplatesTable);
