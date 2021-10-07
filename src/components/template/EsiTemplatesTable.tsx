import { Column } from '@material-table/core';
import React from 'react';

import { Template, TemplateGroupId } from 'generated/sdk';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';
type ProposalEsiTemplateRowDataType = TemplateRowDataType &
  Record<string, unknown>;

type ProposalEsiTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      'templateId' | 'name' | 'description' | 'isArchived' | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function ProposalEsiTemplatesTable(props: ProposalEsiTemplatesTableProps) {
  const columns: Column<ProposalEsiTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# Proposal ESIs', field: 'questionaryCount' },
  ];

  return (
    <TemplatesTable
      columns={columns}
      templateGroup={TemplateGroupId.PROPOSAL_ESI}
      isRowRemovable={() => {
        return true;
      }}
      dataProvider={props.dataProvider}
      confirm={props.confirm}
    />
  );
}

export default withConfirm(ProposalEsiTemplatesTable);
