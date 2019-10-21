import { useCallback, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalAnswer } from "../model/ProposalModel";
import { getDataTypeSpec } from "../model/ProposalModelFunctions";

export function useUpdateProposal() {
  const sendRequest = useDataAPI();
  const [loading, setLoading] = useState(false);

  const updateProposal = useCallback(
    async (parameters: {
      id: number;
      title?: string;
      abstract?: string;
      answers?: ProposalAnswer[];
      users?: number[];
    }) => {
      const query = `
      mutation($id: ID!, $title:String, $abstract:String, $answers:[ProposalAnswerInput], $users:[Int]) {
        updateProposal(id: $id, title:$title, abstract:$abstract, answers: $answers, users:$users){
         proposal{
          id
        }
          error
        }
      }
      `;
      setLoading(true);
      parameters.answers = prepareAnswers(parameters.answers);
      const result = await sendRequest(query, parameters);
      setLoading(false);
      return result;
    },
    [sendRequest]
  );

  return { loading, updateProposal };
}

const prepareAnswers = (answers?: ProposalAnswer[]): ProposalAnswer[] => {
  if (answers) {
    answers = answers.filter(
      answer => getDataTypeSpec(answer.data_type).readonly === false // filter out read only fields
    );
    answers = answers.map(answer => {
      return { ...answer, value: JSON.stringify({ value: answer.value }) }; // store value in JSON to preserve datatype e.g. { "value":74 } or { "value":"yes" } . Because of GraphQL limitations
    });
    return answers;
  } else {
    return [];
  }
};
