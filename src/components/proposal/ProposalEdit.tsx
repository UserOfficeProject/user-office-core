import React from "react";
import ProposalContainer from "./ProposalContainer";
import { useProposalData } from "../../hooks/useProposalData";

export default function ProposalEdit(props: { match: any }): JSX.Element {
  const { proposalData } = useProposalData(
    parseInt(props.match.params.proposalID)
  );

  if (!proposalData) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={proposalData!} />;
}
