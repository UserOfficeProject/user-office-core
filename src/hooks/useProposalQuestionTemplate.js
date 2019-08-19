import { useEffect, useState } from "react";
import { useDataAPI } from "../hooks/useDataAPI";

export function useProposalQuestionTemplate() {
    const sendRequest = useDataAPI();
    const [proposalQuestionModel, setProposalQuestionModel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProposalTemplateRequest = () => {
            const query = `
            query {
              proposalTemplate{
                error
                template {
                  fields {
                  proposal_question_id
                  data_type
                  question
                  config
                }
                }
              }
            }`;
            sendRequest(query).then(data => {
                setLoading(false);
                setProposalQuestionModel(data);
            });
        }
        getProposalTemplateRequest();
    },[]); // passing empty array as a second param so that effect is called only once on mount

    return { loading, proposalQuestionModel };

}