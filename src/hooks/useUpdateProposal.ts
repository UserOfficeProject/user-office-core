import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalAnswer } from "../model/ProposalModel";

export function useUpdateProposal() {
  const sendRequest = useDataAPI();

  const sendAddReview = useCallback(
    async ( parameters: { id:number, title?:string, abstract?:string, answers?:ProposalAnswer[], users?:number[]}) => {
      const query = `
      mutation($id: ID!, $title:String, $abstract:String, $answers:[ProposalAnswer], $users:[Int]) {
        updateProposal(id: $id, title:$title, abstract:$abstract, answers: $answers, users:$users){
         proposal{
          id
        }
          error
        }
      }
      `;

      return await sendRequest(query, parameters).then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReview;
}
