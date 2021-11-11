import { Column } from '@material-table/core';
import React from 'react';

import { Template, TemplateGroupId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

type GenericTemplateRowDataType = TemplateRowDataType & {
  questionaryCount?: number;
};

type GenericTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function GenericTemplatesTable(props: GenericTemplatesTableProps) {
  const columns: Column<GenericTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# templates', field: 'questionaryCount' },
  ];

  return (
    <TemplatesTable
      columns={columns}
      templateGroup={TemplateGroupId.GENERIC_TEMPLATE}
      isRowRemovable={(rowData) => {
        const genericTemplateRowData = rowData as GenericTemplateRowDataType;

        return genericTemplateRowData.questionaryCount === 0;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(GenericTemplatesTable);
