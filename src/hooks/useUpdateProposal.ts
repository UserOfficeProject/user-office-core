import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalAnswer } from "../model/ProposalModel";

export function useUpdateProposal() {
  const sendRequest = useDataAPI();

  const sendAddReview = useCallback(
    async ( params: { id:number, title?:string, abstract?:string, answers?:ProposalAnswer[]}) => {
      const query = `
      mutation($id: ID!, $title:String, $abstract:String, $answers:[ProposalAnswer]) {
        updateProposal(id: $id, title:$title, abstract:$abstract, answers: $answers){
         proposal{
          id
        }
          error
        }
      }
      `;

      return await sendRequest(query, params).then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReview;
}
