import { useEffect, useState } from "react";
import { GetBlankProposalQuery } from "../generated/sdk";
import { useDataApi } from "./useDataApi";

export function useBlankProposal() {
  const sendRequest = useDataApi();
  const [proposal, setProposal] = useState<
    GetBlankProposalQuery["blankProposal"] | null
  >(null);

  useEffect(() => {
    sendRequest()
      .getBlankProposal()
      .then(data => {
        setProposal(data.blankProposal);
      });
  }, [sendRequest]);

  return { proposal };
}
