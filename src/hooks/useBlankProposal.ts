import { useEffect, useState } from "react";
import { Proposal } from "../generated/sdk";
import { useDataApi } from "./useDataApi";

export function useBlankProposal() {
  const [proposal, setProposal] = useState<Proposal | null>(null);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getBlankProposal()
      .then(data => {
        setProposal(data.blankProposal);
      });
  }, [api]);

  return { proposal };
}
