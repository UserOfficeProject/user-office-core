import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { EmailTemplateFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useEmailTemplatesData(): {
  loadingEmailTemplates: boolean;
  emailTemplates: EmailTemplateFragment[];
  setEmailTemplatesWithLoading: Dispatch<
    SetStateAction<EmailTemplateFragment[]>
  >;
} {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateFragment[]>(
    []
  );

  const [loadingEmailTemplates, setLoadingEmailTemplates] = useState(true);

  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setEmailTemplatesWithLoading = (
    data: SetStateAction<EmailTemplateFragment[]>
  ) => {
    setLoadingEmailTemplates(true);
    setEmailTemplates(data);
    setLoadingEmailTemplates(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingEmailTemplates(true);

    if (currentRole && currentRole === UserRole.USER_OFFICER) {
      api()
        .getEmailTemplates()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.emailTemplates) {
            setEmailTemplates(data.emailTemplates.emailTemplates);
          }
          setLoadingEmailTemplates(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole]);

  return {
    loadingEmailTemplates,
    emailTemplates,
    setEmailTemplatesWithLoading,
  };
}
