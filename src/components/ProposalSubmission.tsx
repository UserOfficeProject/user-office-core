import React, {  } from "react";
import ProposalContainer from "./ProposalContainer";
import { useCreateProposal } from "../hooks/useCreateProposal";

export default function ProposalSubmission() {
  const { proposal } = useCreateProposal();

  if (!proposal) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposal}/>;
}
