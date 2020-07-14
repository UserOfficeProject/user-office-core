import { Button, Link } from '@material-ui/core';
import dateformat from 'dateformat';
import MaterialTable, { Column } from 'material-table';
import React, { useState } from 'react';

import {
  Call,
  ProposalTemplate,
  TemplateCategoryId,
} from '../../generated/sdk';
import { useCallsData } from '../../hooks/useCallsData';
import { tableIcons } from '../../utils/materialIcons';
import withConfirm, { WithConfirmType } from '../../utils/withConfirm';
import { ActionButtonContainer } from '../common/ActionButtonContainer';
import InputDialog from '../common/InputDialog';
import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

function CallsList(props: { filterTemplateId: number }) {
  const { callsData } = useCallsData(undefined, props.filterTemplateId);
  const columns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: 'Start Date',
      field: 'startCall',
      render: (rowData: Call) =>
        dateformat(new Date(rowData.startCall), 'dd-mmm-yyyy'),
    },
    {
      title: 'End Date',
      field: 'endCall',
      render: (rowData: Call) =>
        dateformat(new Date(rowData.endCall), 'dd-mmm-yyyy'),
    },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Calls"
      columns={columns}
      data={callsData}
    />
  );
}

function CallsModal(props: { templateId?: number; onClose: () => void }) {
  return (
    <InputDialog
      open={props.templateId !== undefined}
      onClose={props.onClose}
      fullWidth={true}
    >
      <CallsList filterTemplateId={props.templateId!} />
      <ActionButtonContainer>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </ActionButtonContainer>
    </InputDialog>
  );
}
type ProposalTemplateRowDataType = TemplateRowDataType & {
  callCount: number;
  proposalCount: number;
};

function ProposalTemplatesTable(props: IProposalTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();

  const columns: Column<ProposalTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# proposals', field: 'proposalCount' },
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
        isRowRemovable={rowData => {
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
