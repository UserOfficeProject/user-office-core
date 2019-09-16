import { useCallback, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalAnswer } from "../model/ProposalModel";

export function useUpdateProposal() 
{
  const sendRequest = useDataAPI();
  const [loading, setLoading] = useState(false);

  const updateProposal = useCallback(
    async ( parameters: { id:number, title?:string, abstract?:string, answers?:ProposalAnswer[], users?:number[]}) => 
    {
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
      if(parameters.answers)
      {
        parameters.answers!.forEach(answer => {
          answer.answer = answer.answer.toString();
        });
      } 
      const result = await sendRequest(query, parameters);
      setLoading(false);
      return result;
    },
    [sendRequest]

  );

  return {loading, updateProposal};
}


