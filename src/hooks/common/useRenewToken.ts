import { useState, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { useDataApi } from 'hooks/common/useDataApi';

export function useRenewToken() {
  const [renewToken, setRenewToken] = useState<string | null | undefined>(null);
  const { token, handleNewToken } = useContext(UserContext);

  const api = useDataApi();

  const setRenewTokenValue = async () => {
    try {
      const result = await api().getToken({ token });

      if (result.token) {
        setRenewToken(result.token.token);

        handleNewToken(result.token.token);
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };

  return { renewToken, setRenewTokenValue };
}
