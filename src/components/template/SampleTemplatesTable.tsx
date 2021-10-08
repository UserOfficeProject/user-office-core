import { Column } from '@material-table/core';
import React from 'react';

import { Template, TemplateGroupId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

type SampleTemplateRowDataType = TemplateRowDataType & {
  questionaryCount?: number;
};

type SampleTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function SampleTemplatesTable(props: SampleTemplatesTableProps) {
  const columns: Column<SampleTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# samples', field: 'questionaryCount' },
  ];

  return (
    <TemplatesTable
      columns={columns}
      templateGroup={TemplateGroupId.SAMPLE}
      isRowRemovable={(rowData) => {
        const sampleTemplateRowData = rowData as SampleTemplateRowDataType;

        return sampleTemplateRowData.questionaryCount === 0;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(SampleTemplatesTable);
