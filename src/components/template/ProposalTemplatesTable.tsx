import { Dialog, DialogContent, Link } from '@material-ui/core';
import { Column } from 'material-table';
import React, { useState } from 'react';
import { ProposalTemplate, TemplateCategoryId } from '../../generated/sdk';
import { useCallsData } from '../../hooks/useCallsData';
import withConfirm, { WithConfirmType } from '../../utils/withConfirm';
import { CallsTable } from '../call/CallsTable';
import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

function CallsModal(props: { templateId?: number; onClose: () => void }) {
  const { loading, callsData } = useCallsData(undefined, props.templateId);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <Dialog
      open={props.templateId !== undefined}
      fullWidth={true}
      onClose={props.onClose}
    >
      <DialogContent>
        <CallsTable data={callsData} />
      </DialogContent>
    </Dialog>
  );
}
type ProposalTemplateRowDataType = TemplateRowDataType & {
  callCount: number;
  proposalCount: number;
};

function ProposalTemplatesTable(props: IProposalTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();

  const columns: Column<ProposalTemplateRowDataType>[] = [
    { title: 'Template ID', field: 'templateId', editable: 'never' },
    { title: 'Name', field: 'name', editable: 'always' },
    { title: 'Description', field: 'description', editable: 'always' },
    { title: '# proposals', field: 'proposalCount', editable: 'never' },
    {
      title: '# calls',
      field: 'callCount',
      editable: 'never',
      render: rowData => (
        <Link
          onClick={() => {
            setSelectedTemplateId(rowData.templateId);
          }}
          style={{ cursor: 'pointer' }}
        >
          {rowData.callCount}
        </Link>
      ),
    },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateCategory={TemplateCategoryId.PROPOSAL_QUESTIONARY}
        isRowDeleteable={rowData => {
          const proposalTemplateRowData = rowData as ProposalTemplateRowDataType;

          return (
            proposalTemplateRowData.callCount === 0 &&
            proposalTemplateRowData.proposalCount === 0
          );
        }}
        dataProvider={props.dataProvider}
        confirm={props.confirm}
      />
      <CallsModal
        templateId={selectedTemplateId}
        onClose={() => setSelectedTemplateId(undefined)}
      ></CallsModal>
    </>
  );
}

interface IProposalTemplatesTableProps {
  dataProvider: () => Promise<
    Pick<
      ProposalTemplate,
      | 'templateId'
      | 'name'
      | 'description'
      | 'isArchived'
      | 'callCount'
      | 'proposalCount'
    >[]
  >;
  confirm: WithConfirmType;
}

export default withConfirm(ProposalTemplatesTable);
