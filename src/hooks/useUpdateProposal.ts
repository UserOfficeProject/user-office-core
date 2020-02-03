import { useCallback, useState } from "react";
import { getDataTypeSpec } from "../models/ProposalModelFunctions";
import { useDataApi } from "./useDataApi";
import { ProposalAnswer } from "../models/ProposalModel";
import { ProposalStatus } from "../generated/sdk";

export function useUpdateProposal() {
  const [loading, setLoading] = useState(false);

  const api = useDataApi();

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
