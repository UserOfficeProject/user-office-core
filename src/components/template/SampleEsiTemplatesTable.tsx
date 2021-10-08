import { Column } from '@material-table/core';
import React from 'react';

import { Template, TemplateGroupId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';
type EsiTemplateRowDataType = TemplateRowDataType & Record<string, unknown>;

type SampleEsiTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function SampleEsiTemplatesTable(props: SampleEsiTemplatesTableProps) {
  const columns: Column<EsiTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# Sample ESIs', field: 'questionaryCount' },
  ];

  return (
    <TemplatesTable
      columns={columns}
      templateGroup={TemplateGroupId.SAMPLE_ESI}
      isRowRemovable={() => {
        return true;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(SampleEsiTemplatesTable);
