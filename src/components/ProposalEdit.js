import React from "react";
import ProposalContainer from "./ProposalContainer";
import { useProposalData } from "../hooks/useProposalData";

export default function ProposalEdit({ match }) {
  const { loading, proposalData } = useProposalData(match.params.proposalID);

  if (loading) {
    return <p>Loading</p>;
  }
  return <ProposalContainer data={proposalData} />;
}
