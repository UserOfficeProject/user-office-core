import { Column } from '@material-table/core';
import React from 'react';

import { Template, TemplateGroupId } from 'generated/sdk';

import TemplatesTable, { TemplateRowDataType } from './TemplatesTable';

type PdfTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
};

const columns: Column<TemplateRowDataType>[] = [
  { title: 'Name', field: 'name' },
  { title: 'Description', field: 'description' },
];

function PdfTemplatesTable(props: PdfTemplatesTableProps) {
  return (
    <>
      <TemplatesTable
        columns={columns}
        templateGroup={TemplateGroupId.PDF_TEMPLATE}
        isRowRemovable={() => false}
        dataProvider={props.dataProvider}
      />
    </>
  );
}

export default PdfTemplatesTable;
