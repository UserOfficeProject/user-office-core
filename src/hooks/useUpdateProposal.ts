import { useCallback, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalAnswer, ProposalStatus } from "../models/ProposalModel";
import { getDataTypeSpec } from "../models/ProposalModelFunctions";
<<<<<<< HEAD
import { ResourceId } from "@swap/duo-localisation";
=======
import { ResourceId } from "@esss-swap/duo-localisation";
>>>>>>> e15d06f589df235a71bac337e4ed09f361ab9ed5

export function useUpdateProposal() {
  const sendRequest = useDataAPI<{
    updateProposal: { proposal?: { id: number }; error: ResourceId };
  }>();
  const [loading, setLoading] = useState(false);

  const updateProposal = useCallback(
    async (parameters: {
      id: number;
      title?: string;
      abstract?: string;
      answers?: ProposalAnswer[];
      topicsCompleted?: number[];
      status?: ProposalStatus;
      users?: number[];
      proposerId?: number;
      partialSave?: boolean;
    }) => {
      const query = `
      mutation($id: Int!, $title:String, $abstract:String, $answers:[ProposalAnswerInput!], $topicsCompleted:[Int!], $users:[Int!], $proposerId:Int, $partialSave:Boolean) {
        updateProposal(id: $id, title:$title, abstract:$abstract, answers: $answers, topicsCompleted:$topicsCompleted, users:$users, proposerId:$proposerId, partialSave:$partialSave){
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
