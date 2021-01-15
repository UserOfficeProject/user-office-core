import Table, { TableProps } from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';

import UOLoader from 'components/common/UOLoader';
import { Answer } from 'generated/sdk';
import { useQuestionary } from 'hooks/questionary/useQuestionary';
import {
  areDependenciesSatisfied,
  getAllFields,
} from 'models/QuestionaryFunctions';

import {
  formatQuestionaryComponentAnswer,
  getQuestionaryComponentDefinition,
} from './QuestionaryComponentRegistry';

function QuestionaryDetails(
  props: { questionaryId: number } & TableProps<any>
) {
  const { questionaryId, ...restProps } = props;
  const { questionary, loadingQuestionary } = useQuestionary(questionaryId);

  if (loadingQuestionary) {
    return <UOLoader />;
  }

  if (!questionary) {
    return <span>Failed to load questionary details</span>;
  }

  const allFields = getAllFields(questionary.steps) as Answer[];
  const completedFields = allFields.filter(field => {
    const definition = getQuestionaryComponentDefinition(
      field.question.dataType
    );

    return (
      areDependenciesSatisfied(
        questionary.steps,
        field.question.proposalQuestionId
      ) && !definition.readonly
    );
  });

  return (
    <Table size="small" {...restProps}>
      <TableBody>
        {completedFields.map(row => (
          <TableRow key={`answer-${row.answerId}`}>
            <TableCell width="65%">{row.question.question}</TableCell>
            <TableCell>{formatQuestionaryComponentAnswer(row)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default QuestionaryDetails;
