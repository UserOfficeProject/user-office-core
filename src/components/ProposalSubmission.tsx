import React, {  } from "react";
import ProposalContainer from "./ProposalContainer";
import { useBlankProposal } from "../hooks/useBlankProposal";

export default function ProposalSubmission() {
  const { proposal } = useBlankProposal();

  if (!proposal) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposal}/>;
}
