import MaterialTable, { Column } from '@material-table/core';
import { DialogActions, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useCallback, useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { Template, TemplateGroupId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { tableIcons } from 'utils/materialIcons';

import TemplatesTable, { TemplateRowDataType } from './TemplatesTable';

function CallsList(props: { filterTemplateId: number }) {
  const { calls } = useCallsData({ esiTemplateIds: [props.filterTemplateId] });
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
    <StyledDialog
      open={props.templateId !== undefined}
      onClose={props.onClose}
      fullWidth={true}
      title="Associated Calls"
    >
      <DialogContent dividers>
        <CallsList filterTemplateId={props.templateId as number} />
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
export type ProposalEsiTemplateRowDataType = TemplateRowDataType & {
  proposalESICallCount?: number;
};

type ProposalEsiTemplatesTableProps = {
  dataProvider: () => Promise<
    Pick<
      Template,
      | 'templateId'
      | 'name'
      | 'description'
      | 'isArchived'
      | 'questionaryCount'
      | 'proposalESICallCount'
    >[]
  >;
};

function ProposalEsiTemplatesTable(props: ProposalEsiTemplatesTableProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();

  // NOTE: Wrapping NumberOfCalls with useCallback to avoid the console warning(https://github.com/material-table-core/core/issues/286)
  const NumberOfCalls = useCallback(
    (rowData: ProposalEsiTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
        }}
        style={{ cursor: 'pointer' }}
      >
        {rowData.proposalESICallCount || 0}
      </Link>
    ),
    []
  );

  // NOTE: Keeping the columns inside the component just because it needs NumberOfCalls which is wrapped with callback and uses setSelectedTemplateId.
  const columns: Column<ProposalEsiTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    {
      title: '# calls',
      field: 'proposalESICallCount',
      editable: 'never',
      render: NumberOfCalls,
    },
    {
      title: '# Proposal Safety Reviews',
      field: 'questionaryCount',
    },
  ];

  return (
    <>
      <TemplatesTable
        columns={columns}
        templateGroup={TemplateGroupId.PROPOSAL_ESI}
        isRowRemovable={(rowData) => {
          const proposalESITemplateRowData =
            rowData as ProposalEsiTemplateRowDataType;

          return proposalESITemplateRowData.proposalESICallCount === 0;
        }}
        dataProvider={props.dataProvider}
      />
      <CallsModal
        templateId={selectedTemplateId}
        onClose={() => setSelectedTemplateId(undefined)}
      />
    </>
  );
}

export default ProposalEsiTemplatesTable;
