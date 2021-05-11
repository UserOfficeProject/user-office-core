import MaterialTable from 'material-table';
import React, { useMemo } from 'react';

import { TemplateCategoryId } from 'generated/sdk';
import { useProposalsData } from 'hooks/proposal/useProposalsData';
import { useSamplesWithQuestionaryStatus } from 'hooks/sample/useSamplesWithQuestionaryStatus';
import { useShipments } from 'hooks/shipment/useShipments';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { tableIcons } from 'utils/materialIcons';

function ProposalList({ question }: { question: QuestionWithUsage }) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );
  const { proposalsData } = useProposalsData({ questionaryIds });

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={[
        { title: 'Shortcode', field: 'shortCode' },
        { title: 'Title', field: 'title' },
      ]}
      data={proposalsData}
      title="Proposals"
      options={{ paging: false }}
    />
  );
}

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
      columns={[
        { title: 'id', field: 'id' },
        { title: 'Title', field: 'title' },
        { title: 'Created', field: 'created' },
        { title: 'Safety status', field: 'safetyStatus' },
      ]}
      data={samples}
      title="Samples"
      options={{ paging: false }}
    />
  );
}

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
      columns={[
        { title: 'ID', field: 'id' },
        { title: 'Title', field: 'title' },
        { title: 'Status', field: 'status' },
      ]}
      data={shipments}
      title="Shipments"
      options={{ paging: false }}
    />
  );
}

function AnswerCountDetails(props: { question: QuestionWithUsage | null }) {
  const question = props.question;
  switch (question?.categoryId) {
    case TemplateCategoryId.PROPOSAL_QUESTIONARY:
      return <ProposalList question={question} />;
    case TemplateCategoryId.SAMPLE_DECLARATION:
      return <SampleList question={question} />;
    case TemplateCategoryId.SHIPMENT_DECLARATION:
      return <ShipmentList question={question} />;

    default:
      return <span></span>;
  }
}

export default AnswerCountDetails;
