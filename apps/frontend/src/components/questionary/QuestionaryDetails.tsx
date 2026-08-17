import Box from '@mui/material/Box';
import { TableProps } from '@mui/material/Table';
import Typography from '@mui/material/Typography';
import React, { ReactElement, useContext } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Answer, DataType, Questionary } from 'generated/sdk';
import { useIsMobile } from 'hooks/common/useResponsive';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import { areDependenciesSatisfied } from 'models/questionary/QuestionaryFunctions';

import { AnswersTable } from './AnswersTable';
import ReviewAnswerCard from './mobile/ReviewAnswerCard';
import { getQuestionaryComponentDefinition } from './QuestionaryComponentRegistry';
import { QuestionaryContext } from './QuestionaryContext';
import { StepView } from './StepView';

export interface TableRowData {
  label: React.ReactNode;
  value: React.ReactNode;
}
export interface QuestionaryDetailsProps
  extends TableProps<(props: unknown) => ReactElement> {
  questionaryId: number;
  questionaryData?: Questionary; // If provided, it will be used instead of fetching the questionary
  additionalDetails?: Array<TableRowData>;
  title?: string;
  answerRenderer?: (answer: Answer) => React.ReactNode;
}

function QuestionaryDetails(props: QuestionaryDetailsProps) {
  const {
    answerRenderer,
    questionaryId,
    questionaryData,
    additionalDetails,
    title,
  } = props;

  const isMobile = useIsMobile();
  const { state, dispatch } = useContext(QuestionaryContext);

  const { questionary, loadingQuestionary } = useQuestionary(
    questionaryId,
    questionaryData
  );

  if (loadingQuestionary) {
    return (
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
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

    // Resolve by topic, not by the index of this map: the review step is
    // appended, so the two lists need not line up.
    const wizardIndex =
      state?.wizardSteps.findIndex(
        (wizardStep) => wizardStep.payload?.topicId === step.topic.id
      ) ?? -1;
    const wizardStep =
      state && wizardIndex >= 0 && state.wizardSteps[wizardIndex];
    const editable =
      wizardStep &&
      !wizardStep.getMetadata(state, wizardStep.payload).isReadonly;

    return (
      <div data-cy="questionary-details-view" key={step.topic.id}>
        {isMobile ? (
          <ReviewAnswerCard
            title={step.topic.title}
            rows={rows}
            onEdit={
              editable
                ? () =>
                    dispatch({
                      type: 'GO_TO_STEP_CLICKED',
                      stepIndex: wizardIndex,
                    })
                : undefined
            }
          />
        ) : (
          <StepView
            title={step.topic.title}
            content={<AnswersTable rows={rows} />}
          />
        )}
      </div>
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
