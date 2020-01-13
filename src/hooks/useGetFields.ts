import { useEffect, useState } from "react";
import { GetFieldsQuery } from "../generated/sdk";
import { useDataApi2 } from "./useDataApi2";

export function useGetFields() {
  const sendRequest = useDataApi2();
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
