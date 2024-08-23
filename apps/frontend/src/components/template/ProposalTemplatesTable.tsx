import MaterialTable, { Column } from '@material-table/core';
import { DialogActions, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useCallback, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import StyledDialog from 'components/common/StyledDialog';
import { Proposal, ProposalTemplate, TemplateGroupId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { useProposalsData } from 'hooks/proposal/useProposalsData';
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

function ProposalsList(props: { filterTemplateId: number }) {
  const { proposalsData } = useProposalsData({
    templateIds: [props.filterTemplateId],
  });

  const proposalListColumns = [
    {
      title: 'Proposal ID',
      field: 'proposalId',
      render: (proposal: Proposal) => (
        <ReactRouterLink to={`/Proposals?reviewModal=${proposal.primaryKey}`}>
          {proposal.proposalId}
        </ReactRouterLink>
      ),
    },
    {
      title: `Title`,
      field: 'title',
    },
    {
      title: `Submitted`,
      field: 'submitted',
      render: (proposal: Proposal) => (proposal.submitted ? 'Yes' : 'No'),
    },
    {
      title: `Status`,
      field: 'status',
      render: (proposal: Proposal) => proposal.status?.name,
    },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Proposals"
      columns={proposalListColumns}
      data={proposalsData}
    />
  );
}

function CallsModal(props: {
  open: boolean;
  templateId?: number;
  onClose: () => void;
}) {
  return (
    <StyledDialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth="lg"
      title="Calls using the template"
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

function ProposalsModal(props: {
  open: boolean;
  templateId?: number;
  onClose: () => void;
}) {
  return (
    <StyledDialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth="lg"
      data-cy="proposals-modal"
      title="Proposals using the template"
    >
      <DialogContent dividers>
        <ProposalsList filterTemplateId={props.templateId as number} />
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
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
  const [showTemplateCalls, setShowTemplateCalls] = useState<boolean>(false);
  const [showTemplateProposals, setShowTemplateProposals] =
    useState<boolean>(false);

  // NOTE: Wrapping NumberOfCalls with useCallback to avoid the console warning(https://github.com/material-table-core/core/issues/286)
  const NumberOfCalls = useCallback(
    (rowData: ProposalTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
          setShowTemplateCalls(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        {rowData.callCount || 0}
      </Link>
    ),
    []
  );

  const NumberOfProposals = useCallback(
    (rowData: ProposalTemplateRowDataType) => (
      <Link
        onClick={() => {
          setSelectedTemplateId(rowData.templateId);
          setShowTemplateProposals(true);
        }}
        style={{ cursor: 'pointer' }}
        data-cy="proposals-count"
      >
        {rowData.questionaryCount || 0}
      </Link>
    ),
    []
  );

  // NOTE: Keeping the columns inside the component just because it needs NumberOfCalls which is wrapped with callback and uses setSelectedTemplateId.
  const columns: Column<ProposalTemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    {
      title: '# proposals',
      field: 'questionaryCount',
      editable: 'never',
      render: NumberOfProposals,
    },
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
        onClose={() => setShowTemplateCalls(false)}
        open={showTemplateCalls}
      />
      <ProposalsModal
        templateId={selectedTemplateId}
        onClose={() => setShowTemplateProposals(false)}
        open={showTemplateProposals}
      />
    </>
  );
}

export default ProposalTemplatesTable;
