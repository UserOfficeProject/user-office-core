import { useEffect, useState } from "react";
import { request } from "graphql-request";

export function useGetFields() {
  const [fieldContent, setFieldContent] = useState(null);
  const [loading, setLoading] = useState(true);
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

    setLoading(true);
    request("/graphql", query).then(data => {
      setFieldContent(data.getFields);
      setLoading(false);
    });
  }, []);

  return [loading, fieldContent];
}
