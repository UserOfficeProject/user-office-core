import { Column } from 'material-table';
import React from 'react';

import { Template, TemplateCategoryId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';
import withMarkTemplateAsActiveAction from './withMarkTemplateAsActiveAction';

type VisitTemplateRowDataType = TemplateRowDataType & Record<string, unknown>;

type VisitTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function VisitTemplatesTable(props: VisitTemplatesTableProps) {
  const columns: Column<VisitTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# visits', field: 'questionaryCount' },
  ];

  const Table = withMarkTemplateAsActiveAction(TemplatesTable);

  return (
    <Table
      columns={columns}
      templateCategory={TemplateCategoryId.VISIT}
      isRowRemovable={() => {
        return true;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(VisitTemplatesTable);
