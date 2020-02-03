import React from "react";
import { useBlankProposal } from "../hooks/useBlankProposal";
import ProposalContainer from "./ProposalContainer";

export default function ProposalSubmission() {
  const { proposal } = useBlankProposal();

  if (!proposal) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposal} />;
}
