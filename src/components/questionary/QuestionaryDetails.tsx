import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';

import { Answer } from 'generated/sdk';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import {
  areDependenciesSatisfied,
  getAllFields,
} from 'models/QuestionaryFunctions';

import { formatQuestionaryComponentAnswer } from './QuestionaryComponentRegistry';

function QuestionaryDetails(props: { questionaryId: number }) {
  const { questionary } = useQuestionary(props.questionaryId);

  if (!questionary) {
    return <span>loading...</span>;
  }

  const allFields = getAllFields(questionary.steps) as Answer[];
  const completedFields = allFields.filter(field => {
    return areDependenciesSatisfied(
      questionary.steps,
      field.question.proposalQuestionId
    );
  });

  return (
    <>
      <Table>
        <TableBody>
          {completedFields.map(row => (
            <TableRow key={`answer-${row.answerId}`}>
              <TableCell>{row.question.question}</TableCell>
              <TableCell>{formatQuestionaryComponentAnswer(row)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default QuestionaryDetails;
