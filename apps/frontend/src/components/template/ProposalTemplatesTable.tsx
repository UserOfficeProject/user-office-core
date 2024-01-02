import MaterialTable, { Column } from '@material-table/core';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useCallback, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
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
    <InputDialog open={props.open} onClose={props.onClose} fullWidth={true}>
      <CallsList filterTemplateId={props.templateId as number} />
      <ActionButtonContainer>
        <Button variant="text" onClick={() => props.onClose()}>
          Close
        </Button>
      </ActionButtonContainer>
    </InputDialog>
  );
}

function ProposalsModal(props: {
  open: boolean;
  templateId?: number;
  onClose: () => void;
}) {
  return (
    <InputDialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      data-cy="proposals-modal"
    >
      <ProposalsList filterTemplateId={props.templateId as number} />
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
