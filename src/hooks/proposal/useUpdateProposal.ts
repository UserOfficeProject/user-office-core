import { useCallback, useState } from 'react';

import { ProposalStatus, Answer } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { getDataTypeSpec } from 'models/QuestionaryFunctions';

const prepareAnswers = (answers?: Answer[]): Answer[] => {
  if (answers) {
    answers = answers.filter(
      answer => getDataTypeSpec(answer.question.dataType).readonly === false // filter out read only fields
    );
    answers = answers.map(answer => {
      return { ...answer, value: JSON.stringify({ value: answer.value }) }; // store value in JSON to preserve datatype e.g. { "value":74 } or { "value":"yes" } . Because of GraphQL limitations
    });

    return answers;
  } else {
    return [];
  }
};

export function useUpdateProposal() {
  const [loading, setLoading] = useState(false);

  const api = useDataApi();

  const updateProposal = useCallback(
    async (parameters: {
      id: number;
      title?: string;
      abstract?: string;
      answers?: Answer[];
      topicsCompleted?: number[];
      status?: ProposalStatus;
      users?: number[];
      proposerId?: number;
      partialSave?: boolean;
      excellenceScore?: number;
    }) => {
      setLoading(true);
      parameters.answers = prepareAnswers(parameters.answers);
      const result = await api().updateProposal(parameters);
      setLoading(false);

      return result;
    },
    [api]
  );

  return { loading, updateProposal };
}
