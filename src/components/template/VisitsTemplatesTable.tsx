import { Column } from '@material-table/core';
import React from 'react';

import { Template, TemplateGroupId } from 'generated/sdk';
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
      templateGroup={TemplateGroupId.VISIT_REGISTRATION}
      isRowRemovable={() => {
        return true;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(VisitTemplatesTable);
