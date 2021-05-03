import { makeStyles, Typography } from '@material-ui/core';
import Table, { TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import React, { FC } from 'react';

import UOLoader from 'components/common/UOLoader';
import { Answer, DataType, Question } from 'generated/sdk';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import {
  areDependenciesSatisfied,
  getAllFields,
} from 'models/QuestionaryFunctions';

import { getQuestionaryComponentDefinition } from './QuestionaryComponentRegistry';

const useStyles = makeStyles(() => ({
  label: {
    paddingLeft: 0,
  },
  value: {
    width: '35%',
  },
}));

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
  const {
    answerRenderer,
    questionaryId,
    additionalDetails,
    title,
    ...restProps
  } = props;

  const { questionary, loadingQuestionary } = useQuestionary(questionaryId);
  const classes = useStyles();

  if (loadingQuestionary) {
    return <UOLoader />;
  }

  if (!questionary) {
    return <span>Failed to load questionary details</span>;
  }

  const allQuestions = getAllFields(questionary.steps) as Answer[];
  const displayableQuestions = allQuestions.filter((field) => {
    const definition = getQuestionaryComponentDefinition(
      field.question.dataType
    );

    return (
      (!definition.readonly ||
        field.question.dataType === DataType.SAMPLE_DECLARATION) &&
      areDependenciesSatisfied(questionary.steps, field.question.id)
    );
  });

  const createTableRow = (key: string, rowData: TableRowData) => (
    <TableRow key={key}>
      <TableCell className={classes.label}>{rowData.label}</TableCell>
      <TableCell className={classes.value}>{rowData.value}</TableCell>
    </TableRow>
  );

  return (
    <>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Table size="small" {...restProps}>
        <TableBody>
          {/* Additional details */}
          {additionalDetails?.map((row, index) =>
            createTableRow(`additional-detail-${index}`, row)
          )}

          {/* questionary details */}
          {displayableQuestions.map((answer) => {
            const renderers = getQuestionaryComponentDefinition(
              answer.question.dataType
            ).renderers;

            if (!renderers) {
              return null;
            }

            const questionElem = React.createElement<Question>(
              renderers.questionRenderer,
              answer.question
            );
            const answerElem =
              answerRenderer?.(answer) ||
              React.createElement<Answer>(renderers.answerRenderer, answer);

            return createTableRow(
              `answer-${answer.answerId}-${answer.question.id}`,
              {
                label: questionElem,
                value: answerElem,
              }
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}

export default QuestionaryDetails;
