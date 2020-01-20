import { useEffect, useState } from "react";
import { GetBlankProposalQuery } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useBlankProposal() {
  const sendRequest = useDataApi2();
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
