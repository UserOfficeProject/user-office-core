import { Column } from 'material-table';
import React from 'react';

import { Template, TemplateCategoryId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

type SampleTemplateRowDataType = TemplateRowDataType & {};

function SampleTemplatesTable(props: SampleTemplatesTableProps) {
  const columns: Column<SampleTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# samples', field: 'questionaryCount' },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateCategory={TemplateCategoryId.SAMPLE_DECLARATION}
        isRowRemovable={() => {
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
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
}

export default withConfirm(SampleTemplatesTable);
