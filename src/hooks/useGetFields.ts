import { useEffect, useState } from "react";
import { GetFieldsQuery } from "../generated/sdk";
import { useDataApi } from "./useDataApi";

export function useGetFields() {
  const sendRequest = useDataApi();
  const [fieldContent, setFieldContent] = useState<
    GetFieldsQuery["getFields"] | null
  >(null);
  useEffect(() => {
    sendRequest()
      .getFields()
      .then(data => {
        setFieldContent(data.getFields);
      });
  }, [sendRequest]);

  return fieldContent;
}
