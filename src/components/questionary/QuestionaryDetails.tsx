import Box from '@mui/material/Box';
import { TableProps } from '@mui/material/Table';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Answer, DataType } from 'generated/sdk';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import { areDependenciesSatisfied } from 'models/questionary/QuestionaryFunctions';

import { AnswersTable } from './AnswersTable';
import { getQuestionaryComponentDefinition } from './QuestionaryComponentRegistry';
import { StepView } from './StepView';

export interface TableRowData {
  label: JSX.Element | string | null;
  value: JSX.Element | string | null;
}
export interface QuestionaryDetailsProps extends TableProps<FC<unknown>> {
  questionaryId: number;
  additionalDetails?: Array<TableRowData>;
  title?: string;
  answerRenderer?: (answer: Answer) => JSX.Element | null;
}

function QuestionaryDetails(props: QuestionaryDetailsProps) {
  const { answerRenderer, questionaryId, additionalDetails, title } = props;

  const { questionary, loadingQuestionary } = useQuestionary(questionaryId);

  if (loadingQuestionary) {
    return (
      <Box textAlign="center">
        <UOLoader />
      </Box>
    );
  }

  if (!questionary) {
    return <span>Failed to load questionary details</span>;
  }

  const steps = questionary.steps.map((step, index) => {
    const displayableQuestions = step.fields.filter((field) => {
      const definition = getQuestionaryComponentDefinition(
        field.question.dataType
      );

      return (
        (!definition.readonly ||
          field.question.dataType === DataType.SAMPLE_DECLARATION ||
          field.question.dataType === DataType.GENERIC_TEMPLATE) &&
        areDependenciesSatisfied(questionary.steps, field.question.id)
      );
    });

    const rows = displayableQuestions
      .map((answer) => {
        const renderers = getQuestionaryComponentDefinition(
          answer.question.dataType
        ).renderers;

        if (!renderers) {
          return null;
        }

        const questionElem = renderers.questionRenderer(answer.question);
        const answerElem =
          answerRenderer?.(answer) || renderers.answerRenderer(answer);

        const row: TableRowData = {
          label: questionElem,
          value: answerElem,
        };

        return row;
      })
      .filter((row) => row !== null) as TableRowData[];

    if (index === 0 && additionalDetails !== undefined) {
      rows.unshift(...additionalDetails);
    }

    const stepContent = <AnswersTable rows={rows} />;

    return (
      <StepView
        title={step.topic.title}
        content={stepContent}
        key={step.topic.id}
      />
    );
  });

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      {steps}
    </>
  );
}

export default QuestionaryDetails;
