import MaterialTable from '@material-table/core';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import React, { useMemo, useState } from 'react';

import CopyToClipboard from 'components/common/CopyToClipboard';
import { ProposalFragment, TemplateCategoryId } from 'generated/sdk';
import {
  ProposalsDataQuantity,
  useProposalsData,
} from 'hooks/proposal/useProposalsData';
import { useSamplesWithQuestionaryStatus } from 'hooks/sample/useSamplesWithQuestionaryStatus';
import { useShipments } from 'hooks/shipment/useShipments';
import { QuestionWithUsage } from 'hooks/template/useQuestions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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
    title: 'Proposal title',
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

function ProposalList({
  question,
  onQuestionUsageChanged,
}: {
  question: QuestionWithUsage;
  onQuestionUsageChanged?: () => void;
}) {
  const questionaryIds = useMemo(
    () => question.answers.map((answer) => answer.questionaryId),
    [question]
  );
  const [removedProposalPrimaryKeys, setRemovedProposalPrimaryKeys] = useState<
    number[]
  >([]);
  const { api } = useDataApiWithFeedback();

  const { proposalsData } = useProposalsData(
    { questionaryIds },
    ProposalsDataQuantity.MINIMAL
  );

  const proposalsDataWithId = proposalsData
    .filter((proposal) => !removedProposalPrimaryKeys.includes(proposal.primaryKey))
    .map((proposal) =>
      Object.assign(proposal, { id: proposal.primaryKey })
    );

  return (
    <MaterialTable
      style={{ width: '100%' }}
      icons={tableIcons}
      columns={[
        ...proposalListColumns,
        {
          title: '',
          sorting: false,
          render: (rowData: ProposalFragment) => (
            <Button
              color="error"
              variant="outlined"
              data-cy="remove-question-from-proposal-btn"
              onClick={async () => {
                const dataApi = api({
                  toastErrorMessage: 'Failed to remove question from proposal',
                  toastSuccessMessage: 'Question removed from proposal',
                });

                const { proposal } = await dataApi.getProposal({
                  primaryKey: rowData.primaryKey,
                });

                if (!proposal?.questionary) {
                  throw new Error(
                    `Questionary was not found for proposal ${rowData.primaryKey}`
                  );
                }

                const stepWithQuestion = proposal.questionary.steps.find((step) =>
                  step.fields.some((field) => field.question.id === question.id)
                );
                if (!stepWithQuestion) {
                  throw new Error(
                    `Question ${question.id} is not part of proposal ${rowData.proposalId}`
                  );
                }

                const answers = stepWithQuestion.fields
                  .filter((field) => field.question.id !== question.id)
                  .map((field) => ({
                    questionId: field.question.id,
                    // answerTopic expects answer payload in shape { value: ... }
                    value: JSON.stringify({ value: field.value ?? null }),
                  }));

                await dataApi.answerTopic({
                  questionaryId: proposal.questionary.questionaryId,
                  topicId: stepWithQuestion.topic.id,
                  answers,
                  isPartialSave: true,
                });

                setRemovedProposalPrimaryKeys((prevProposalPrimaryKeys) =>
                  prevProposalPrimaryKeys.includes(proposal.primaryKey)
                    ? prevProposalPrimaryKeys
                    : [...prevProposalPrimaryKeys, proposal.primaryKey]
                );
                onQuestionUsageChanged?.();
              }}
            >
              Remove
            </Button>
          ),
        },
      ]}
      data={proposalsDataWithId}
      title="Proposals"
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

function AnswerCountDetails(props: {
  question: QuestionWithUsage | null;
  onQuestionUsageChanged?: () => void;
}) {
  const question = props.question;
  switch (question?.categoryId) {
    case TemplateCategoryId.PROPOSAL_QUESTIONARY:
      return (
        <ProposalList
          question={question}
          onQuestionUsageChanged={props.onQuestionUsageChanged}
        />
      );
    case TemplateCategoryId.SAMPLE_DECLARATION:
      return <SampleList question={question} />;
    case TemplateCategoryId.SHIPMENT_DECLARATION:
      return <ShipmentList question={question} />;

    default:
      return <span></span>;
  }
}

export default AnswerCountDetails;
