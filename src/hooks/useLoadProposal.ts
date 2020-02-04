import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useLoadProposal() {
  const api = useDataApi();

  const loadProposal = useCallback(
    async (id: number) => (await api().getProposal({ id })).proposal!,
    [api]
  );

  return { loadProposal };
}
