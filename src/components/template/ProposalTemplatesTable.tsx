import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import dateformat from 'dateformat';
import MaterialTable, { Column } from 'material-table';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import { Call, ProposalTemplate, TemplateCategoryId } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { tableIcons } from 'utils/materialIcons';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { TemplateRowDataType, TemplatesTable } from './TemplatesTable';

function CallsList(props: { filterTemplateId: number }) {
  const { calls } = useCallsData({ templateIds: [props.filterTemplateId] });
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
      data={calls}
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
      <CallsList filterTemplateId={props.templateId as number} />
      <ActionButtonContainer>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </ActionButtonContainer>
    </InputDialog>
  );
}
export type ProposalTemplateRowDataType = TemplateRowDataType & {
  callCount?: number;
  questionaryCount?: number;
};

type ProposalTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      ProposalTemplate,
      | 'templateId'
      | 'name'
      | 'description'
      | 'isArchived'
      | 'callCount'
      | 'questionaryCount'
    >[]
  >;
  confirm: WithConfirmType;
};

function ProposalTemplatesTable(props: ProposalTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();

  const NumberOfCalls = (rowData: ProposalTemplateRowDataType) => (
    <Link
      onClick={() => {
        setSelectedTemplateId(rowData.templateId);
      }}
      style={{ cursor: 'pointer' }}
    >
      {rowData.callCount || 0}
    </Link>
  );

  const columns: Column<ProposalTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    { title: '# proposals', field: 'questionaryCount' },
    {
      title: '# calls',
      field: 'callCount',
      editable: 'never',
      render: NumberOfCalls,
    },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateCategory={TemplateCategoryId.PROPOSAL_QUESTIONARY}
        isRowRemovable={(rowData) => {
          const proposalTemplateRowData = rowData as ProposalTemplateRowDataType;

          return (
            proposalTemplateRowData.callCount === 0 &&
            proposalTemplateRowData.questionaryCount === 0
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

export default withConfirm(ProposalTemplatesTable);
