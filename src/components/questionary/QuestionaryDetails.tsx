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

import { getQuestionaryComponentDefinition } from './QuestionaryComponentRegistry';

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

  const allQuestions = getAllFields(questionary.steps) as Answer[];
  const displayableQuestions = allQuestions.filter(field => {
    const definition = getQuestionaryComponentDefinition(
      field.question.dataType
    );

    return (
      !definition.readonly &&
      areDependenciesSatisfied(
        questionary.steps,
        field.question.proposalQuestionId
      )
    );
  });

  return (
    <>
      <Table size="small" {...restProps}>
        <TableBody>
          {displayableQuestions.map(question => {
            const renderers = getQuestionaryComponentDefinition(
              question.question.dataType
            ).renderers;

            if (!renderers) {
              return null;
            }

            const questionElem = renderers.questionRenderer({
              question: question.question,
            });
            const answerElem = renderers.answerRenderer({
              answer: question,
            });

            return (
              <TableRow key={`answer-${question.answerId}`}>
                <TableCell>{questionElem}</TableCell>
                <TableCell width="35%">{answerElem}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}

export default QuestionaryDetails;
