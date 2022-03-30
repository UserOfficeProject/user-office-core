import MaterialTable, { Column } from '@material-table/core';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useCallback, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import { ProposalTemplate, TemplateGroupId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { tableIcons } from 'utils/materialIcons';

import TemplatesTable, { TemplateRowDataType } from './TemplatesTable';

function CallsList(props: { filterTemplateId: number }) {
  const { calls } = useCallsData({ templateIds: [props.filterTemplateId] });
  const { toFormattedDateTime, timezone } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const callListColumns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: `Start Date(${timezone})`,
      field: 'startCallFormatted',
    },
    {
      title: `End Date(${timezone})`,
      field: 'endCallFormatted',
    },
  ];

  const callsWithFormattedDates = calls.map((call) => ({
    ...call,
    startCallFormatted: toFormattedDateTime(call.startCall),
    endCallFormatted: toFormattedDateTime(call.endCall),
  }));

  return (
    <MaterialTable
      icons={tableIcons}
      title="Calls"
      columns={callListColumns}
      data={callsWithFormattedDates}
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
};

function ProposalTemplatesTable(props: ProposalTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();

  // NOTE: Wrapping NumberOfCalls with useCallback to avoid the console warning(https://github.com/material-table-core/core/issues/286)
  const NumberOfCalls = useCallback(
    (rowData: ProposalTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
        }}
        style={{ cursor: 'pointer' }}
      >
        {rowData.callCount || 0}
      </Link>
    ),
    []
  );

  // NOTE: Keeping the columns inside the component just because it needs NumberOfCalls which is wrapped with callback and uses setSelectedTemplateId.
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
        templateGroup={TemplateGroupId.PROPOSAL}
        isRowRemovable={(rowData) => {
          const proposalTemplateRowData =
            rowData as ProposalTemplateRowDataType;

          return (
            proposalTemplateRowData.callCount === 0 &&
            proposalTemplateRowData.questionaryCount === 0
          );
        }}
        dataProvider={props.dataProvider}
      />
      <CallsModal
        templateId={selectedTemplateId}
        onClose={() => setSelectedTemplateId(undefined)}
      ></CallsModal>
    </>
  );
}

export default ProposalTemplatesTable;
