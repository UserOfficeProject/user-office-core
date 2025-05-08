import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  QuestionaryStep,
  TemplateGroupId,
  VisitRegistrationStatus,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { RegistrationWithQuestionary } from 'models/questionary/visit/VisitRegistrationWithQuestionary';

function createRegistrationStub(
  userId: number,
  templateId: number,
  questionarySteps: QuestionaryStep[],
  visitId: number
): RegistrationWithQuestionary {
  return {
    userId: userId,
    registrationQuestionaryId: 0,
    status: VisitRegistrationStatus.DRAFTED,
    startsAt: null,
    endsAt: null,
    visitId: visitId,
    user: {
      firstname: '',
      lastname: '',
      preferredname: '',
      id: userId,
      created: new Date(),
      institution: '',
      institutionId: 1,
      placeholder: false,
      position: '',
      email: '',
      country: '',
    },
    questionary: {
      isCompleted: false,
      questionaryId: 0,
      templateId: templateId,
      created: new Date(),
      steps: questionarySteps,
    },
  };
}

export function useBlankVisitRegistration(visitId?: number | null) {
  const [blankRegistration, setBlankRegistration] =
    useState<RegistrationWithQuestionary | null>(null);

  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(UserContext);

  const api = useDataApi();

  useEffect(() => {
    if (!visitId || !user.id) {
      if (!user.id) {
        setError('User not available');
      }

      return;
    }
    api()
      .getActiveTemplateId({
        templateGroupId: TemplateGroupId.VISIT_REGISTRATION,
      })
      .then(({ activeTemplateId }) => {
        if (activeTemplateId) {
          api()
            .getBlankQuestionarySteps({ templateId: activeTemplateId })
            .then((result) => {
              if (result.blankQuestionarySteps) {
                const newBlankRegistration = createRegistrationStub(
                  user.id,
                  activeTemplateId,
                  result.blankQuestionarySteps,
                  visitId
                );
                setBlankRegistration(newBlankRegistration);
                setError(null);
              } else {
                setError('Could not create visit registration stub');
              }
            });
        } else {
          setError('There is no active visit registration template');
        }
      })
      .catch(() => {
        setError('Failed to fetch data for blank visit registration');
      });
  }, [api, user, visitId]);

  return { blankRegistration, error };
}
