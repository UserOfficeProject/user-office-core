import { useEffect, useState } from "react";
import { request } from "graphql-request";

export function useGetFields() {
  const [fieldContent, setFieldContent] = useState<{
    institutions: { id: number; value: string }[];
    nationalities: { id: number; value: string }[];
  } | null>(null);
  useEffect(() => {
    const query = `
    query {
      getFields{
        institutions{
            id
            value
          }
          nationalities{
            id
            value
          }
      }
    }`;

    request("/graphql", query).then(data => {
      setFieldContent(data.getFields);
    });
  }, []);

  return fieldContent;
}
