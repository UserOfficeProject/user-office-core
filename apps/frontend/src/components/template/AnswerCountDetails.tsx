import MaterialTable from '@material-table/core';
import Link from '@mui/material/Link';
import React, { useMemo } from 'react';

import CopyToClipboard from 'components/common/CopyToClipboard';
import { ProposalFragment, TemplateCategoryId } from 'generated/sdk';
import { useGenericTemplatesData } from 'hooks/genericTemplate/useGenericTemplatesData';
import { useProposalsData } from 'hooks/proposal/useProposalsData';
import { useSamplesWithQuestionaryStatus } from 'hooks/sample/useSamplesWithQuestionaryStatus';
import { useShipments } from 'hooks/shipment/useShipments';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { useVisitRegistrationsWithVisitAndUsers } from 'hooks/visit/useVisitRegistrationsWithVisitAndUsers';
import { GenericTemplateCoreWithProposalData } from 'models/questionary/genericTemplate/GenericTemplateCore';
import { tableIcons } from 'utils/materialIcons';

const proposalListColumns = [
  {
    title: 'ID',
    render: (rowData: ProposalFragment) => (
      <CopyToClipboard text={rowData.proposalId} position="right">
        {rowData.proposalId}
      </CopyToClipboard>
    ),
  },
  {
    title: 'Generic Template title',
    render: (rowData: ProposalFragment) => (
      <Link
        title={rowData.title}
        href={`Proposals?reviewModal=${rowData.primaryKey}`}
      >
        {rowData.title}
      </Link>
    ),
  },
];

function ProposalList({ question }: { question: QuestionWithUsage }) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );
  const { proposalsData } = useProposalsData({ questionaryIds });

  const proposalsDataWithId = proposalsData.map((proposal) =>
    Object.assign(proposal, { id: proposal.primaryKey })
  );

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={proposalListColumns}
      data={proposalsDataWithId}
      title="Proposals"
      options={{ paging: false }}
    />
  );
}

const genericListColumns = [
  { title: 'Generic Template title', field: 'title' },
  { title: 'Created', field: 'created' },
  { title: 'Proposal title', field: 'proposal.title' },
  {
    title: 'Proposal ID',
    render: (rowData: GenericTemplateCoreWithProposalData) => (
      <Link
        title={rowData.proposal.proposalId}
        href={`Proposals?reviewModal=${rowData.proposal.primaryKey}`}
      >
        {rowData.title}
      </Link>
    ),
  },
];

function GenericTemplateList({ question }: { question: QuestionWithUsage }) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );
  const { genericTemplates } = useGenericTemplatesData({ questionaryIds });

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={genericListColumns}
      data={genericTemplates}
      title="Generic Templates"
      options={{ paging: false }}
    />
  );
}

const sampleListColumns = [
  { title: 'Sample title', field: 'title' },
  { title: 'Created', field: 'created' },
  { title: 'Safety status', field: 'safetyStatus' },
];

function SampleList({ question }: { question: QuestionWithUsage }) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );
  const { samples } = useSamplesWithQuestionaryStatus({ questionaryIds });

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={sampleListColumns}
      data={samples}
      title="Samples"
      options={{ paging: false }}
    />
  );
}

const shipmentListColumns = [
  {
    title: 'Shipment title',
    field: 'title',
  },
  { title: 'Status', field: 'status' },
];

function ShipmentList({ question }: { question: QuestionWithUsage }) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );
  const { shipments } = useShipments({ questionaryIds });

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={shipmentListColumns}
      data={shipments}
      title="Shipments"
      options={{ paging: false }}
    />
  );
}

const visitRegistrationListColumns = [
  { title: 'Sample title', field: 'userId' },
  { title: 'Created', field: 'visitId' },
];

function VisitRegistrationList({ question }: { question: QuestionWithUsage }) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );

  const visitRegistrationsWithQuestionaryAndUsers =
    useVisitRegistrationsWithVisitAndUsers({
      registrationQuestionaryIds: questionaryIds,
    });

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={visitRegistrationListColumns}
      data={visitRegistrationsWithQuestionaryAndUsers.visitRegistrations}
      title="Visit registrations"
      options={{ paging: false }}
    />
  );
}

function AnswerCountDetails(props: { question: QuestionWithUsage | null }) {
  const question = props.question;
  switch (question?.categoryId) {
    case TemplateCategoryId.PROPOSAL_QUESTIONARY:
      return <ProposalList question={question} />;
    case TemplateCategoryId.GENERIC_TEMPLATE:
      return <GenericTemplateList question={question} />;
    case TemplateCategoryId.SAMPLE_DECLARATION:
      return <SampleList question={question} />;
    case TemplateCategoryId.SHIPMENT_DECLARATION:
      return <ShipmentList question={question} />;
    case TemplateCategoryId.VISIT_REGISTRATION:
      return <VisitRegistrationList question={question} />;

    default:
      return <span></span>;
  }
}

export default AnswerCountDetails;
